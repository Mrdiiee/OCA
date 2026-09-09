07:13:57.674 Running build in Washington, D.C., USA (East) – iad1
07:13:57.675 Build machine configuration: 2 cores, 8 GB
07:13:57.732 Cloning github.com/Mrdiiee/OCA (Branch: main, Commit: a03e872)
07:13:57.733 Skipping build cache, deployment was triggered without cache.
07:13:58.076 Cloning completed: 344.000ms
07:13:58.547 Running "vercel build"
07:13:58.567 Vercel CLI 59.11.7
07:13:58.734 Installing dependencies...
07:14:08.682 npm warn deprecated next@14.2.5: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
07:14:08.708 
07:14:08.709 added 32 packages in 10s
07:14:08.710 
07:14:08.711 3 packages are looking for funding
07:14:08.711   run `npm fund` for details
07:14:08.753 Detected Next.js version: 14.2.5
07:14:08.757 Running "npm run build"
07:14:09.105 
07:14:09.105 > oxygen-gear-equipment@0.1.0 build
07:14:09.106 > next build
07:14:09.106 
07:14:09.672 Attention: Next.js now collects completely anonymous telemetry regarding usage.
07:14:09.673 This information is used to shape Next.js' roadmap and prioritize features.
07:14:09.673 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
07:14:09.673 https://nextjs.org/telemetry
07:14:09.673 
07:14:09.732   ▲ Next.js 14.2.5
07:14:09.733 
07:14:09.750    Creating an optimized production build ...
07:14:13.699 Failed to compile.
07:14:13.702 
07:14:13.703 ./app/page.jsx
07:14:13.703 Error: 
07:14:13.703   x the name `paying` is defined multiple times
07:14:13.704      ,-[/vercel/path0/app/page.jsx:84:1]
07:14:13.704   84 |   const [checkoutOpen, setCheckoutOpen] = useState(false);
07:14:13.705   85 |   const [confirmed, setConfirmed] = useState(false);
07:14:13.705   86 |   const [form, setForm] = useState({ name: "", phone: "", address: "" });
07:14:13.705   87 |   const [paying, setPaying] = useState(false);
07:14:13.705      :          ^^^|^^
07:14:13.705      :             `-- previous definition of `paying` here
07:14:13.706   88 |   const [payError, setPayError] = useState("");
07:14:13.706   89 | 
07:14:13.706   90 |   const addToCart = (item) => {
07:14:13.706   91 |     setCart((prev) => {
07:14:13.706   92 |       const found = prev.find((p) => p.id === item.id);
07:14:13.707   93 |       return found
07:14:13.707   94 |         ? prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p)
07:14:13.707   95 |         : [...prev, { ...item, qty: 1 }];
07:14:13.707   96 |     });
07:14:13.707   97 |     setCartOpen(true);
07:14:13.707   98 |   };
07:14:13.708   99 | 
07:14:13.708  100 |   const updateQty = (id, delta) => {
07:14:13.708  101 |     setCart((prev) => prev.map((p) => p.id === id ? { ...p, qty: p.qty + delta } : p).filter((p) => p.qty > 0));
07:14:13.708  102 |   };
07:14:13.709  103 | 
07:14:13.709  104 |   const total = useMemo(() => cart.reduce((sum, p) => sum + p.price * p.qty, 0), [cart]);
07:14:13.709  105 |   const itemCount = cart.reduce((sum, p) => sum + p.qty, 0);
07:14:13.710  106 |   const [paying, setPaying] = useState(false);
07:14:13.710      :          ^^^|^^
07:14:13.710      :             `-- `paying` redefined here
07:14:13.710  107 | const [payError, setPayError] = useState("");
07:14:13.710  108 | 
07:14:13.711  109 | const submitOrder = async (e) => {
07:14:13.711      `----
07:14:13.711 
07:14:13.711   x the name `setPaying` is defined multiple times
07:14:13.712      ,-[/vercel/path0/app/page.jsx:84:1]
07:14:13.712   84 |   const [checkoutOpen, setCheckoutOpen] = useState(false);
07:14:13.714   85 |   const [confirmed, setConfirmed] = useState(false);
07:14:13.715   86 |   const [form, setForm] = useState({ name: "", phone: "", address: "" });
07:14:13.715   87 |   const [paying, setPaying] = useState(false);
07:14:13.715      :                  ^^^^|^^^^
07:14:13.716      :                      `-- previous definition of `setPaying` here
07:14:13.716   88 |   const [payError, setPayError] = useState("");
07:14:13.716   89 | 
07:14:13.716   90 |   const addToCart = (item) => {
07:14:13.717   91 |     setCart((prev) => {
07:14:13.717   92 |       const found = prev.find((p) => p.id === item.id);
07:14:13.717   93 |       return found
07:14:13.717   94 |         ? prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p)
07:14:13.718   95 |         : [...prev, { ...item, qty: 1 }];
07:14:13.718   96 |     });
07:14:13.718   97 |     setCartOpen(true);
07:14:13.718   98 |   };
07:14:13.719   99 | 
07:14:13.719  100 |   const updateQty = (id, delta) => {
07:14:13.719  101 |     setCart((prev) => prev.map((p) => p.id === id ? { ...p, qty: p.qty + delta } : p).filter((p) => p.qty > 0));
07:14:13.719  102 |   };
07:14:13.720  103 | 
07:14:13.720  104 |   const total = useMemo(() => cart.reduce((sum, p) => sum + p.price * p.qty, 0), [cart]);
07:14:13.720  105 |   const itemCount = cart.reduce((sum, p) => sum + p.qty, 0);
07:14:13.721  106 |   const [paying, setPaying] = useState(false);
07:14:13.721      :                  ^^^^|^^^^
07:14:13.721      :                      `-- `setPaying` redefined here
07:14:13.722  107 | const [payError, setPayError] = useState("");
07:14:13.722  108 | 
07:14:13.722  109 | const submitOrder = async (e) => {
07:14:13.722      `----
07:14:13.722 
07:14:13.723   x the name `payError` is defined multiple times
07:14:13.723      ,-[/vercel/path0/app/page.jsx:85:1]
07:14:13.723   85 |   const [confirmed, setConfirmed] = useState(false);
07:14:13.724   86 |   const [form, setForm] = useState({ name: "", phone: "", address: "" });
07:14:13.724   87 |   const [paying, setPaying] = useState(false);
07:14:13.724   88 |   const [payError, setPayError] = useState("");
07:14:13.724      :          ^^^^|^^^
07:14:13.725      :              `-- previous definition of `payError` here
07:14:13.725   89 | 
07:14:13.725   90 |   const addToCart = (item) => {
07:14:13.725   91 |     setCart((prev) => {
07:14:13.726   92 |       const found = prev.find((p) => p.id === item.id);
07:14:13.726   93 |       return found
07:14:13.726   94 |         ? prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p)
07:14:13.726   95 |         : [...prev, { ...item, qty: 1 }];
07:14:13.727   96 |     });
07:14:13.727   97 |     setCartOpen(true);
07:14:13.727   98 |   };
07:14:13.727   99 | 
07:14:13.728  100 |   const updateQty = (id, delta) => {
07:14:13.728  101 |     setCart((prev) => prev.map((p) => p.id === id ? { ...p, qty: p.qty + delta } : p).filter((p) => p.qty > 0));
07:14:13.728  102 |   };
07:14:13.729  103 | 
07:14:13.729  104 |   const total = useMemo(() => cart.reduce((sum, p) => sum + p.price * p.qty, 0), [cart]);
07:14:13.729  105 |   const itemCount = cart.reduce((sum, p) => sum + p.qty, 0);
07:14:13.729  106 |   const [paying, setPaying] = useState(false);
07:14:13.730  107 | const [payError, setPayError] = useState("");
07:14:13.730      :        ^^^^|^^^
07:14:13.730      :            `-- `payError` redefined here
07:14:13.731  108 | 
07:14:13.731  109 | const submitOrder = async (e) => {
07:14:13.731  110 |   e.preventDefault();
07:14:13.731      `----
07:14:13.732 
07:14:13.732   x the name `setPayError` is defined multiple times
07:14:13.732      ,-[/vercel/path0/app/page.jsx:85:1]
07:14:13.733   85 |   const [confirmed, setConfirmed] = useState(false);
07:14:13.733   86 |   const [form, setForm] = useState({ name: "", phone: "", address: "" });
07:14:13.733   87 |   const [paying, setPaying] = useState(false);
07:14:13.733   88 |   const [payError, setPayError] = useState("");
07:14:13.734      :                    ^^^^^|^^^^^
07:14:13.734      :                         `-- previous definition of `setPayError` here
07:14:13.734   89 | 
07:14:13.735   90 |   const addToCart = (item) => {
07:14:13.735   91 |     setCart((prev) => {
07:14:13.735   92 |       const found = prev.find((p) => p.id === item.id);
07:14:13.735   93 |       return found
07:14:13.736   94 |         ? prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + 1 } : p)
07:14:13.736   95 |         : [...prev, { ...item, qty: 1 }];
07:14:13.736   96 |     });
07:14:13.736   97 |     setCartOpen(true);
07:14:13.737   98 |   };
07:14:13.737   99 | 
07:14:13.737  100 |   const updateQty = (id, delta) => {
07:14:13.738  101 |     setCart((prev) => prev.map((p) => p.id === id ? { ...p, qty: p.qty + delta } : p).filter((p) => p.qty > 0));
07:14:13.738  102 |   };
07:14:13.738  103 | 
07:14:13.738  104 |   const total = useMemo(() => cart.reduce((sum, p) => sum + p.price * p.qty, 0), [cart]);
07:14:13.739  105 |   const itemCount = cart.reduce((sum, p) => sum + p.qty, 0);
07:14:13.739  106 |   const [paying, setPaying] = useState(false);
07:14:13.740  107 | const [payError, setPayError] = useState("");
07:14:13.740      :                  ^^^^^|^^^^^
07:14:13.740      :                       `-- `setPayError` redefined here
07:14:13.741  108 | 
07:14:13.741  109 | const submitOrder = async (e) => {
07:14:13.741  110 |   e.preventDefault();
07:14:13.742      `----
07:14:13.742 
07:14:13.742 Import trace for requested module:
07:14:13.742 ./app/page.jsx
07:14:13.743 
07:14:13.745 
07:14:13.745 > Build failed because of webpack errors
07:14:13.795 Error: Command "npm run build" exited with 1
