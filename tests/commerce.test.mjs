import test from "node:test"; import assert from "node:assert/strict";
import {PRODUCTS,getProduct,addToCart,setCartQty,removeFromCart,cartSubtotal,calculateTotals,validateCheckout,localeRoute} from "../store/store-core.mjs";
test("catalog is bilingual",()=>{assert.ok(PRODUCTS.length>=6); assert.ok(PRODUCTS.every(p=>p.en.name&&p.ar.name));});
test("product lookup rejects unknown ids",()=>{assert.equal(getProduct("nope"),null); assert.equal(getProduct("commerce").id,"commerce");});
test("cart persists correct quantities",()=>{let c=addToCart([],"commerce",2); c=addToCart(c,"commerce",1); assert.equal(c[0].qty,3); c=setCartQty(c,"commerce",2); assert.equal(c[0].qty,2); c=removeFromCart(c,"commerce"); assert.equal(c.length,0);});
test("totals calculate VAT after discount",()=>{const c=addToCart([],"brand-system",1); const t=calculateTotals(c,{discount:1000}); assert.equal(t.subtotal,6000); assert.equal(t.vat,750); assert.equal(t.total,5750);});
test("checkout validation catches missing fields",()=>{assert.equal(validateCheckout({}).valid,false); assert.equal(validateCheckout({name:"A",email:"a@b.com",phone:"1",city:"Riyadh"}).valid,true);});
test("locale routes preserve bilingual structure",()=>{assert.equal(localeRoute("ar","checkout.html"),"/ar/store/checkout.html"); assert.equal(localeRoute("en","checkout.html"),"/store/checkout.html");});
