import { useState, useEffect } from "react";
import { DASHBOARDNAV } from "@/data/dashboardData.ts";
import { Link, useRouter } from "@tanstack/react-router";

function DashboardBottomTab() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[460px] max-w-[95vw] -translate-x-1/2">
      <div className="flex items-center justify-between gap-2 rounded-[24px] border border-[#2b2933] bg-[#0f0d16]/95 px-3 py-2">
        {DASHBOARDNAV.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex min-w-[70px] flex-col items-center justify-center rounded-[16px] px-2 py-1.5
                                transition-colors hover:bg-[#15131d]
                ${
                  isActive
                    ? "border border-[#2b2933] bg-[#15131d] text-white"
                    : "text-[#8f8a99] hover:text-white"
                }
              `}
            >
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-current/60">
                {item.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default DashboardBottomTab;
