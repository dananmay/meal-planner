import { NavLink, Outlet } from "react-router-dom";
import { HomeIcon, BookIcon, CalendarIcon } from "./Icons";

const navItems = [
  { to: "/", label: "Today", Icon: HomeIcon },
  { to: "/recipes", label: "Recipes", Icon: BookIcon },
  { to: "/week", label: "Week", Icon: CalendarIcon },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-warm-100 border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-warm-800">
            Meal Planner
          </h1>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                    isActive
                      ? "bg-warm-500 text-white"
                      : "text-warm-600 hover:bg-warm-100"
                  }`
                }
              >
                <item.Icon className="w-4 h-4 hidden sm:block" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

    </div>
  );
}
