import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DailyPlanner from "./pages/DailyPlanner";
import RecipeBank from "./pages/RecipeBank";
import RecipeDetail from "./pages/RecipeDetail";
import WeeklyOverview from "./pages/WeeklyOverview";
import GroceryList from "./pages/GroceryList";
import ImportRecipe from "./pages/ImportRecipe";
import EditRecipe from "./pages/EditRecipe";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DailyPlanner />} />
          <Route path="/recipes" element={<RecipeBank />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/import" element={<ImportRecipe />} />
          <Route path="/edit/:id" element={<EditRecipe />} />
          <Route path="/week" element={<WeeklyOverview />} />
          <Route path="/grocery" element={<GroceryList />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
