import { Route, Routes } from "react-router";
import Layout from "@/components/Layout";
import { InsuranceDataProvider } from "@/providers/InsuranceDataProvider";
import { CompareProvider } from "@/providers/CompareProvider";
import { SearchProvider } from "@/providers/SearchProvider";
import Home from "@/pages/Home";
import Placeholder from "@/pages/Placeholder";

export default function App() {
  return (
    <InsuranceDataProvider>
      <CompareProvider>
        <SearchProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="categories" element={<Placeholder title="保險類別" />} />
              <Route path="category/:categoryId" element={<Placeholder title="類別詳情" />} />
              <Route path="product/:productId" element={<Placeholder title="產品詳情" />} />
              <Route path="compare" element={<Placeholder title="比較工具" />} />
              <Route path="insurers" element={<Placeholder title="保險公司名錄" />} />
              <Route path="guides" element={<Placeholder title="投保指南" />} />
              <Route path="about" element={<Placeholder title="關於數據" />} />
              <Route
                path="*"
                element={<Placeholder title="404" description="呢一頁唔存在。" />}
              />
            </Route>
          </Routes>
        </SearchProvider>
      </CompareProvider>
    </InsuranceDataProvider>
  );
}
