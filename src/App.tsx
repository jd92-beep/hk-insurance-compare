import { Route, Routes } from "react-router";
import Layout from "@/components/Layout";
import { InsuranceDataProvider } from "@/providers/InsuranceDataProvider";
import { CompareProvider } from "@/providers/CompareProvider";
import { SearchProvider } from "@/providers/SearchProvider";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import ProductDetail from "@/pages/ProductDetail";
import Compare from "@/pages/Compare";
import Insurers from "@/pages/Insurers";
import Guides from "@/pages/Guides";
import Vhis from "@/pages/Vhis";
import About from "@/pages/About";
import DataQuality from "@/pages/DataQuality";
import Documents from "@/pages/Documents";
import Placeholder from "@/pages/Placeholder";

export default function App() {
  return (
    <InsuranceDataProvider>
      <CompareProvider>
        <SearchProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="categories" element={<Categories />} />
              <Route path="category/:categoryId" element={<CategoryDetail />} />
              <Route path="product/:productId" element={<ProductDetail />} />
              <Route path="compare" element={<Compare />} />
              <Route path="insurers" element={<Insurers />} />
              <Route path="guides" element={<Guides />} />
              <Route path="vhis" element={<Vhis />} />
              <Route path="about" element={<About />} />
              <Route path="data-quality" element={<DataQuality />} />
              <Route path="documents" element={<Documents />} />
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
