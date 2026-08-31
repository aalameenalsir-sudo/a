import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});try{
 const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
 const body=await req.json(); if(!Array.isArray(body.items)||!body.items.length) throw new Error("Cart is empty");
 const ids=[...new Set(body.items.map((x:any)=>x.product_id))];
 const {data:products,error}=await supabase.from("store_products").select("id,name_en,sku,price,active").in("id",ids).eq("active",true); if(error)throw error;
 const map=new Map(products.map((p:any)=>[p.id,p])); let subtotal=0;
 const lines=body.items.map((x:any)=>{const p:any=map.get(x.product_id);const q=Math.max(1,Math.min(99,Math.floor(Number(x.quantity)||1)));if(!p)throw new Error("Invalid product");const line=Number(p.price)*q;subtotal+=line;return {product_id:p.id,name:p.name_en,sku:p.sku,unit_price:p.price,quantity:q,line_total:line}});
 const vat=Math.round(subtotal*.15*100)/100,total=subtotal+vat,order_number=`AS-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
 const {data:order,error:oe}=await supabase.from("orders").insert({order_number,email:body.email,name:body.name,phone:body.phone,city:body.city,company:body.company,subtotal,vat,total,notes:body.notes||null}).select().single();if(oe)throw oe;
 const {error:ie}=await supabase.from("order_items").insert(lines.map((x:any)=>({...x,order_id:order.id})));if(ie)throw ie;
 return new Response(JSON.stringify({ok:true,order_number,total}),{headers:{...cors,"Content-Type":"application/json"},status:201});
}catch(e){return new Response(JSON.stringify({ok:false,error:String(e.message||e)}),{headers:{...cors,"Content-Type":"application/json"},status:400})}});
