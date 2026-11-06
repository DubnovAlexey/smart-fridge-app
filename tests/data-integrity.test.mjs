// Проверки локального демо без внешних сетевых запросов и полей реальных пользователей.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { parseCSV, batchesToCSV, csvRowToProduct } from '../js/utils/csvCodec.js';
import { TRANSLATIONS } from '../js/utils/translations.js';

async function fixture(cloudOverrides = {}) {
    const values = new Map(); let cloudCalls = 0;
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const cloud = () => { cloudCalls++; throw new Error('Demo must never contact Firestore'); };
    const context = vm.createContext({ localStorage: storage, console, Date, Math,
        db: {}, collection: cloud, getDocs: cloud, addDoc: cloud, deleteDoc: cloud,
        doc: cloud, updateDoc: cloud, getDoc: cloud, setDoc: cloud, ...cloudOverrides });
    for (const file of ['utils/localStore', 'models/Fridge', 'models/Analytics']) {
        let source = await readFile(new URL(`../js/${file}.js`, import.meta.url), 'utf8');
        source = source.replace(/^import .*;\r?\n/gm, '').replace(/export function /g, 'function ').replace(/export class (\w+)/g, 'globalThis.$1 = class $1');
        vm.runInContext(source, context);
    }
    return { values, context, cloudCalls: () => cloudCalls };
}

test('guest CRUD, cart and reload are isolated in project-prefixed storage with zero Firestore calls', async () => {
    const f = await fixture(); const model = new f.context.FridgeModel();
    await model.fetchBatchesFromCloud();
    await model.addBatch('Milk', 'Dairy', 2, 'l', 5, '', true, false, false, 12.5, 'ILS', '', 'Fresh');
    const id = model.batches[0].id;
    await model.updateFullBatch(id, { note: 'Updated', id: 'override' });
    assert.equal(model.batches[0].id, id);
    await model.addCartItem('Eggs', 'Other', 6, 'pcs');
    const reloaded = new f.context.FridgeModel();
    await reloaded.fetchBatchesFromCloud(); await reloaded.fetchCartFromCloud();
    assert.equal(reloaded.batches[0].note, 'Updated'); assert.equal(reloaded.cart.length, 1);
    await reloaded.removeBatch(id); await reloaded.removeCartItem(reloaded.cart[0].id);
    assert.equal(reloaded.batches.length + reloaded.cart.length, 0);
    assert.equal(f.cloudCalls(), 0);
    assert.ok([...f.values.keys()].every(key => key.startsWith('smart-fridge-app:demo:')));
});

test('demo analytics persists locally and rejects invalid consumption', async () => {
    const f = await fixture(); const model = new f.context.AnalyticsModel();
    await model.loadFromCloud(); await model.recordConsumption('2'); await model.recordConsumption(NaN);
    await model.recordWaste(1, 4); await model.recordWaste(-1, 500);
    const reloaded = new f.context.AnalyticsModel(); await reloaded.loadFromCloud();
    assert.deepEqual(JSON.parse(JSON.stringify(reloaded.getStats())), { consumed: 2, wasted: 1, moneyLost: 4 });
    assert.equal(f.cloudCalls(), 0);
});

test('invalid product data cannot be persisted or sent to cloud', async () => {
    const f = await fixture(); const model = new f.context.FridgeModel();
    await assert.rejects(model.addBatch('Milk', '', -1, 'l', 5, '', false, false, false, 0));
    await assert.rejects(model.addCartItem('Milk', '', Infinity, 'l'));
    assert.equal(f.values.size, 0); assert.equal(f.cloudCalls(), 0);
});

test('CSV round trip preserves comma, quotes, multiline notes, price, currency and cooked flag', () => {
    const batch = { id: 'one', name: 'Milk, "fresh"', category: 'Food', count: 2, unit: 'l',
        addedAt: Date.parse('2026-11-05'), expirationDate: Date.parse('2026-11-12'),
        price: 12.5, note: ['Line one', 'Line two #2'].join(String.fromCharCode(10)), isCooked: true, currency: 'ILS', composition: 'a,b' };
    const rows = parseCSV(batchesToCSV([batch]));
    assert.equal(rows.length, 2); assert.equal(rows[0][0], 'ID'); assert.ok(batch.note.includes(String.fromCharCode(10)));
    const p = csvRowToProduct(rows[1]);
    assert.equal(p.name, batch.name); assert.equal(p.note, batch.note); assert.equal(p.price, batch.price);
    assert.equal(p.currency, 'ILS'); assert.equal(p.isCooked, true); assert.equal(p.composition, 'a,b');
});

test('CSV handles CRLF quoted newlines and rejects unterminated strings/impossible dates', () => {
    const crlf = String.fromCharCode(13, 10); assert.equal(parseCSV(`a,b${crlf}"line${crlf}one",two${crlf}`)[1][0], `line${crlf}one`);
    assert.throws(() => parseCSV('a,"unfinished'));
    assert.throws(() => csvRowToProduct(['id','Milk','Food','1','l','','30.02.2026']));
});


// Контроллер загружается полностью; DOM/SDK/рендер — границы теста, модели и prefs — реальные.
async function bootGuestWithDeniedStorage(denial) {
    const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const elements = new Map(), timers = [], rendered = {fridge:[], cart:[], stats:[]}, toasts = [];
    const classList = () => {
        const values = new Set();
        return { add: (...names) => names.forEach(name => values.add(name)), remove: (...names) => names.forEach(name => values.delete(name)),
            contains: name => values.has(name), toggle(name, force) { const enabled = force ?? !values.has(name); if (enabled) values.add(name); else values.delete(name); return enabled; },
            replace(from, to) { if (!values.has(from)) return false; values.delete(from); values.add(to); return true; } };
    };
    for (const [, id] of html.matchAll(/\bid\s*=\s*['"]([^'"]+)['"]/g)) {
        const handlers = new Map();
        elements.set(id, { value: '', textContent: '', innerHTML: '', dataset: {}, classList: classList(),
            addEventListener(name, fn) { const list = handlers.get(name) ?? []; list.push(fn); handlers.set(name, list); },
            async emit(name) { for (const fn of handlers.get(name) ?? []) await fn({ target: this }); },
            focus() {}, scrollIntoView() {} });
    }
    const get = id => { assert.ok(elements.has(id), `Actual HTML contains #${id}`); return elements.get(id); };
    get('lang-selector').value = 'ru';
    let cloudCalls = 0, authCallback;
    const cloud = () => { cloudCalls++; throw new Error('Guest bootstrap must never contact Firestore'); };
    const document = { getElementById: get, querySelectorAll: () => [], body: {}, documentElement: {} };
    const window = { navigator: {userAgent:'iPhone'}, addEventListener() {}, scrollTo() {} };
    const context = vm.createContext({ window, document, console, Date, Math, TRANSLATIONS, Map,
        db:{}, auth:{}, collection:cloud,getDocs:cloud,addDoc:cloud,deleteDoc:cloud,doc:cloud,updateDoc:cloud,getDoc:cloud,setDoc:cloud,
        onAuthStateChanged(_auth, callback) { authCallback = callback; callback(null); },
        signInWithEmailAndPassword:cloud, createUserWithEmailAndPassword:cloud,
        renderFridgeContents: rows => rendered.fridge.push(rows), renderCartContents: rows => rendered.cart.push(rows), renderAnalytics: stats => rendered.stats.push(stats),
        showToast: (message, type) => toasts.push({message,type}), playSound() {},
        getFormData: () => ({ name:'Milk', category:'Dairy', count:2, unit:'l', finalDays:5, exactDate:'', price:4, currency:'ILS', note:'', composition:'', isFrozen:false, isCooked:false, isPerishable:false }),
        validateProductData: () => ({valid:true}), clearAddForm() {}, fillAddForm() {}, executeConsumption:cloud,
        formatAiResponse:cloud, escapeHtml:value=>String(value), sanitizeAiHtml:cloud,
        askGeminiRecipe:cloud, askGeminiProductInfo:cloud, askGeminiMissingIngredients:cloud,
        exportToCSV:cloud, importFromCSV:cloud, initScanner:()=>()=>{}, guessExpirationDays:()=>5,
        t:(_key,fallback)=>fallback, flatpickr:()=>({destroy(){},clear(){}}), setTimeout:callback=>{timers.push(callback);return timers.length;} });
    const denied = () => { throw new DOMException('Storage is disabled', 'SecurityError'); };
    if (denial === 'getter') Object.defineProperty(context, 'localStorage', {get:denied});
    else context.localStorage = {getItem:denied,setItem:denied};
    for (const file of ['utils/localStore','models/Fridge','models/Analytics','app']) {
        let source = await readFile(new URL(`../js/${file}.js`, import.meta.url), 'utf8');
        source = source.replace(/^import .*;\r?\n/gm, '').replace(/export function /g, 'function ').replace(/export class (\w+)/g, 'globalThis.$1 = class $1');
        vm.runInContext(source, context, {filename:`${file}.js`});
    }
    await get('btn-auth-guest').emit('click');
    await new Promise(resolve => setImmediate(resolve));
    while (timers.length) timers.shift()();
    return { context, get, rendered, toasts, cloudCalls:()=>cloudCalls, lateAuth:()=>authCallback(null) };
}

for (const denial of ['getter','methods']) test(`full guest controller boot survives localStorage ${denial} SecurityError`, async () => {
    const app = await bootGuestWithDeniedStorage(denial);
    assert.equal(app.get('auth-modal').classList.contains('hidden'), true);
    assert.equal(app.get('loader-overlay').classList.contains('hidden'), true);
    assert.equal(app.context.window.appLang, 'ru'); assert.ok(app.rendered.fridge.length > 0); assert.ok(app.rendered.stats.length > 0);
    app.lateAuth(); assert.equal(app.get('auth-modal').classList.contains('hidden'), true);
    app.get('user-name-input').value = 'Demo'; await app.get('user-name-input').emit('input');
    assert.equal(vm.runInContext("readPreference('smart_fridge_username')", app.context), 'Demo');
    app.get('api-key-input').value = 'not-a-real-key'; await app.get('btn-save-api').emit('click');
    assert.equal(vm.runInContext("readPreference('gemini_api_key')", app.context), 'not-a-real-key');
    assert.match(app.toasts.at(-1).message, /текущей вкладке/);
    await app.get('btn-close-instruction').emit('click');
    await app.get('btn-close-pwa-banner').emit('click');
    await app.get('btn-add').emit('click');
    assert.equal(app.rendered.fridge.at(-1)[0].name, 'Milk');
    assert.equal(app.cloudCalls(), 0);
});


const deferred = () => { let resolve; const promise = new Promise(done => {resolve = done;}); return {promise,resolve}; };
const cloudRows = name => ({forEach:visit=>visit({id:'shared',data:()=>({name,count:1})})});

test('pending cloud CRUD cannot replace or contaminate the current local batches/cart', async () => {
    const operations = [
        model=>model.fetchBatchesFromCloud(),
        model=>model.addBatch('Remote secret','Food',1,'pcs',5,'',false,false,false,1),
        model=>model.removeBatch('shared'),
        model=>model.updateFullBatch('shared',{name:'Remote secret'}),
        model=>model.fetchCartFromCloud(),
        model=>model.addCartItem('Remote secret','Food',1,'pcs'),
        model=>model.removeCartItem('shared')
    ];
    for (const operation of operations) {
        const pending = deferred();
        const f = await fixture({collection:()=>({}),doc:()=>({}),getDocs:()=>pending.promise,
            addDoc:()=>pending.promise,deleteDoc:()=>pending.promise,updateDoc:()=>pending.promise});
        f.values.set('smart-fridge-app:demo:batches',JSON.stringify([{id:'shared',name:'Local milk',count:1,expirationDate:Date.now()+86400000}]));
        f.values.set('smart-fridge-app:demo:cart',JSON.stringify([{id:'shared',name:'Local eggs',count:1}]));
        const model = new f.context.FridgeModel(); model.setLocalMode(false);
        model.batches=[{id:'shared',name:'Old cloud',count:1}]; model.cart=[{id:'shared',name:'Old cloud',count:1}];
        const result = operation(model);
        model.setLocalMode(true); await model.fetchBatchesFromCloud(); await model.fetchCartFromCloud();
        pending.resolve({...cloudRows('Remote secret'),id:'remote'}); await result;
        assert.equal(model.batches.length,1); assert.equal(model.batches[0].name,'Local milk');
        assert.equal(model.cart.length,1); assert.equal(model.cart[0].name,'Local eggs');
        await model.addBatch('Current local','Food',1,'pcs',5,'',false,false,false,1);
        await model.addCartItem('Current local','Food',1,'pcs');
        assert.equal(f.values.get('smart-fridge-app:demo:batches').includes('Remote secret'),false);
        assert.equal(f.values.get('smart-fridge-app:demo:cart').includes('Remote secret'),false);
    }
});

test('pending cloud analytics cannot overwrite local stats or create a stale cloud document', async () => {
    for (const exists of [true,false]) {
        const pending = deferred(); let creates=0;
        const f = await fixture({doc:()=>({}),getDoc:()=>pending.promise,setDoc:()=>{creates++;return Promise.resolve();}});
        f.values.set('smart-fridge-app:demo:stats',JSON.stringify({consumed:2,wasted:1,moneyLost:3}));
        const model = new f.context.AnalyticsModel(); model.setLocalMode(false); const result=model.loadFromCloud();
        model.setLocalMode(true); await model.loadFromCloud();
        pending.resolve({exists:()=>exists,data:()=>({consumed:999,wasted:999,moneyLost:999})}); await result;
        await model.recordConsumption(1);
        assert.deepEqual(JSON.parse(f.values.get('smart-fridge-app:demo:stats')),{consumed:3,wasted:1,moneyLost:3});
        assert.equal(creates,0);
    }
});

test('returning to cloud starts a new generation even when an old cloud request is still pending', async () => {
    const oldRows = deferred(), oldStats = deferred(); let rowCalls=0,statCalls=0;
    const f = await fixture({collection:()=>({}),doc:()=>({}),
        getDocs:()=>++rowCalls===1?oldRows.promise:Promise.resolve(cloudRows('New cloud')),
        getDoc:()=>++statCalls===1?oldStats.promise:Promise.resolve({exists:()=>true,data:()=>({consumed:4,wasted:0,moneyLost:0})})});
    const model=new f.context.FridgeModel(), stats=new f.context.AnalyticsModel();
    model.setLocalMode(false); stats.setLocalMode(false);
    const previousRows=model.fetchBatchesFromCloud(), previousStats=stats.loadFromCloud();
    model.setLocalMode(true); stats.setLocalMode(true);
    await model.addCartItem('Local only','Food',1,'pcs');
    model.setLocalMode(false); stats.setLocalMode(false);
    await model.fetchBatchesFromCloud(); await stats.loadFromCloud();
    oldRows.resolve(cloudRows('Old cloud'));oldStats.resolve({exists:()=>true,data:()=>({consumed:999,wasted:999,moneyLost:999})});
    await previousRows;await previousStats;
    assert.equal(model.batches[0].name,'New cloud');assert.equal(model.cart.length,0);
    assert.equal(stats.getStats().consumed,4);
});

test('local mutations cannot replay into a newly selected cloud session', async () => {
    const f=await fixture(), model=new f.context.FridgeModel(), stats=new f.context.AnalyticsModel();
    const added=model.addBatch('Local only','Food',1,'pcs',5,'',false,false,false,1);
    const consumed=stats.recordConsumption(2);
    model.setLocalMode(false);stats.setLocalMode(false);
    await added;await consumed;
    assert.equal(model.batches.length,0);assert.equal(stats.getStats().consumed,0);assert.equal(f.cloudCalls(),0);
    assert.equal(JSON.parse(f.values.get('smart-fridge-app:demo:batches'))[0].name,'Local only');
});
