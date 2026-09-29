"use client";

import { useState, useEffect, useCallback } from "react";

interface Inquiry {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  created_at: string;
  read: boolean;
}

interface PriceTier { price: number; moq: number; unit: string; }

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  brand: string | null;
  size: string | null;
  material: string | null;
  pricing: PriceTier[];
  description: string;
  image_url: string | null;
  in_stock: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  premium?: boolean;
}

type Tab = "inquiries" | "products" | "categories";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [tab, setTab] = useState<Tab>("inquiries");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  const headers = useCallback(() => ({ "x-admin-key": adminKey, "Content-Type": "application/json" }), [adminKey]);

  const loadInquiries = useCallback(async () => {
    const res = await fetch("/api/inquiries", { headers: { "x-admin-key": adminKey } });
    if (res.ok) setInquiries(await res.json());
  }, [adminKey]);

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products", { headers: { "x-admin-key": adminKey } });
    if (res.ok) setProducts(await res.json());
  }, [adminKey]);

  const loadCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories", { headers: { "x-admin-key": adminKey } });
    if (res.ok) setCategories(await res.json());
  }, [adminKey]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminKey(password);
    setLoggedIn(true);
  }

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    Promise.all([loadInquiries(), loadProducts(), loadCategories()]).finally(() => setLoading(false));
  }, [loggedIn, loadInquiries, loadProducts, loadCategories]);

  async function deleteInquiry(id: number) {
    if (!confirm("Delete this inquiry?")) return;
    await fetch("/api/inquiries", { method: "DELETE", headers: headers(), body: JSON.stringify({ id }) });
    loadInquiries();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/admin/products", { method: "DELETE", headers: headers(), body: JSON.stringify({ id }) });
    loadProducts();
  }

  async function saveProduct(product: Partial<Product> & { id?: string }) {
    const method = product.id && products.find(p => p.id === product.id) ? "PUT" : "POST";
    await fetch("/api/admin/products", { method, headers: headers(), body: JSON.stringify(product) });
    setEditProduct(null);
    setShowAddProduct(false);
    loadProducts();
  }

  async function saveCategory(cat: Partial<Category> & { id?: string }, isEdit: boolean) {
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit ? cat : { name: cat.name, slug: cat.id, description: cat.description, premium: cat.premium };
    await fetch("/api/admin/categories", { method, headers: headers(), body: JSON.stringify(body) });
    setShowAddCategory(false);
    setEditCategory(null);
    loadCategories();
  }

  async function deleteCategory(id: string) {
    const count = products.filter(p => p.category === id).length;
    if (count > 0 && !confirm(`This category has ${count} products. Delete anyway?`)) return;
    if (count === 0 && !confirm("Delete this category?")) return;
    await fetch("/api/admin/categories", { method: "DELETE", headers: headers(), body: JSON.stringify({ id }) });
    loadCategories();
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-gray-500 text-sm mt-1">Party Paragon Dashboard</p>
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-primary-500 outline-none" required />
          <button type="submit" className="btn-primary w-full justify-center">Login</button>
        </form>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-500">Loading...</div></div>;
  }

  const filteredProducts = filterCat === "all" ? products : products.filter(p => p.category === filterCat);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold gradient-text">Admin Panel</h1>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["inquiries", "products", "categories"] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-white shadow text-primary-600" : "text-gray-500 hover:text-gray-700"}`}>
                  {t === "inquiries" ? `📩 Inquiries (${inquiries.length})` : t === "products" ? `📦 Products (${products.length})` : `📂 Categories (${categories.length})`}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { setLoggedIn(false); setAdminKey(""); }} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* =================== INQUIRIES TAB =================== */}
        {tab === "inquiries" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Customer Inquiries</h2>
            {inquiries.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-lg">No inquiries yet</p>
                <p className="text-sm mt-1">Inquiries from the contact form will appear here</p>
              </div>
            ) : inquiries.map(inq => (
              <div key={inq.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{inq.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                      {inq.email && <span>📧 {inq.email}</span>}
                      {inq.phone && <span>📞 {inq.phone}</span>}
                      <span>🕐 {new Date(inq.created_at).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteInquiry(inq.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                </div>
                <p className="mt-3 text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{inq.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* =================== PRODUCTS TAB =================== */}
        {tab === "products" && (
          <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Products</h2>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({products.filter(p => p.category === c.id).length})</option>
                  ))}
                </select>
              </div>
              <button onClick={() => { setShowAddProduct(true); setEditProduct(null); }} className="btn-primary text-sm py-2 px-4">+ Add Product</button>
            </div>

            {(showAddProduct || editProduct) && (
              <ProductForm
                product={editProduct}
                categories={categories}
                onSave={saveProduct}
                onCancel={() => { setEditProduct(null); setShowAddProduct(false); }}
                adminKey={adminKey}
              />
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Image</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Pricing</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(p => {
                    const catName = categories.find(c => c.id === p.category)?.name || p.category;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {p.image_url ? <img src={p.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">No img</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.sku}</div>
                        </td>
                        <td className="px-4 py-3"><span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">{catName}</span></td>
                        <td className="px-4 py-3 text-xs">
                          {p.pricing?.map((t, i) => <div key={i}>₹{t.price} / {t.moq} {t.unit}</div>)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditProduct(p); setShowAddProduct(false); }} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Edit</button>
                            <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-400">No products in this category</div>
              )}
            </div>
          </div>
        )}

        {/* =================== CATEGORIES TAB =================== */}
        {tab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Categories</h2>
              <button onClick={() => { setShowAddCategory(true); setEditCategory(null); }} className="btn-primary text-sm py-2 px-4">+ Add Category</button>
            </div>

            {(showAddCategory || editCategory) && (
              <CategoryForm
                category={editCategory}
                onSave={saveCategory}
                onCancel={() => { setShowAddCategory(false); setEditCategory(null); }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat.id).length;
                return (
                  <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{cat.name}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">/{cat.slug}</p>
                      </div>
                      {cat.premium && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">★ Premium</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-2">{cat.description || "No description"}</p>
                    <p className="text-primary-600 font-medium text-sm mt-2">{count} products</p>
                    <div className="mt-4 flex gap-3 border-t border-gray-100 pt-3">
                      <button onClick={() => { setFilterCat(cat.id); setTab("products"); }} className="text-primary-500 text-xs font-medium hover:text-primary-700">View Products →</button>
                      <button onClick={() => { setEditCategory(cat); setShowAddCategory(false); }} className="text-blue-500 text-xs font-medium hover:text-blue-700">Edit</button>
                      <button onClick={() => deleteCategory(cat.id)} className="text-red-400 text-xs font-medium hover:text-red-600">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =================== PRODUCT FORM =================== */
function ProductForm({ product, categories, onSave, onCancel, adminKey }: {
  product: Product | null;
  categories: Category[];
  onSave: (p: Partial<Product>) => void;
  onCancel: () => void;
  adminKey: string;
}) {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || (categories[0]?.id ?? ""));
  const [sku, setSku] = useState(product?.sku || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [size, setSize] = useState(product?.size || "");
  const [material, setMaterial] = useState(product?.material || "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [pricingText, setPricingText] = useState(
    product?.pricing?.map(t => `${t.price}/${t.moq}/${t.unit}`).join("\n") || ""
  );
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", category);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: formData,
    });
    if (res.ok) {
      const { url } = await res.json();
      setImageUrl(url);
    }
    setUploading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pricing = pricingText.split("\n").filter(Boolean).map(line => {
      const parts = line.split("/");
      return { price: parseFloat(parts[0]), moq: parseInt(parts[1]) || 1, unit: parts[2] || "pcs" };
    });
    const id = product?.id || category.substring(0, 3) + "-" + Date.now().toString().slice(-6);
    onSave({ id, name, category, sku, brand: brand || null, size: size || null, material: material || null, description, image_url: imageUrl || null, pricing, in_stock: true });
  }

  const selectedCatName = categories.find(c => c.id === category)?.name || category;

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-6 mb-6">
      <h3 className="font-bold text-lg mb-4">{product ? `Edit: ${product.name}` : "Add New Product"}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">This product will appear under: <span className="font-medium text-primary-600">{selectedCatName}</span></p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">SKU / Item Code</label>
          <input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. MC 431-14" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
          <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Magic Castle" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
          <input value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. 57*90 Cm" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Material</label>
          <input value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. Foil, Latex" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Pricing (one tier per line: price/moq/unit)</label>
          <textarea value={pricingText} onChange={e => setPricingText(e.target.value)} rows={3} placeholder={"660/10/Pkts\n650/40/Pkts\n640/400/Pkts"} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none" />
          <p className="text-xs text-gray-400 mt-1">Format: price/minimum-order-quantity/unit. E.g. &quot;40/80/pcs&quot; means ₹40 per piece, minimum 80 pieces</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Product Image</label>
          <div className="flex items-center gap-4">
            {imageUrl && <img src={imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg border" />}
            <div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
              {uploading && <span className="text-xs text-primary-500 block mt-1">Uploading...</span>}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" className="btn-primary text-sm py-2 px-6">{product ? "Update Product" : "Add Product"}</button>
          <button type="button" onClick={onCancel} className="border border-gray-300 text-gray-600 py-2 px-6 rounded-full text-sm hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}

/* =================== CATEGORY FORM =================== */
function CategoryForm({ category, onSave, onCancel }: {
  category: Category | null;
  onSave: (c: Partial<Category> & { id?: string }, isEdit: boolean) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [premium, setPremium] = useState(category?.premium || false);

  function autoSlug(val: string) {
    setName(val);
    if (!category) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ id: category?.id || slug, name, slug: category?.slug || slug, description, premium }, !!category);
  }

  return (
    <div className="bg-white rounded-xl border border-green-200 p-6 mb-6">
      <h3 className="font-bold text-lg mb-4">{category ? `Edit: ${category.name}` : "Add New Category"}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category Name *</label>
          <input value={name} onChange={e => autoSlug(e.target.value)} required placeholder="e.g. Foil Balloons" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Slug (URL path) *</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} required disabled={!!category} placeholder="auto-generated" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50 focus:ring-2 focus:ring-primary-500 outline-none disabled:text-gray-400" />
          <p className="text-xs text-gray-400 mt-1">URL: /catalog/<span className="font-medium">{slug || "..."}</span></p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description shown on catalog page" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={premium} onChange={e => setPremium(e.target.checked)} className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
            <span className="font-medium text-gray-700">Premium category</span>
          </label>
          <p className="text-xs text-gray-400 mt-1">Premium categories are shown in a separate section with &quot;Customizable&quot; badge</p>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" className="btn-primary text-sm py-2 px-6">{category ? "Update Category" : "Add Category"}</button>
          <button type="button" onClick={onCancel} className="border border-gray-300 text-gray-600 py-2 px-6 rounded-full text-sm hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
