import React, { Suspense } from "react";
import DashboardPage from "./page";
import { BarLoader } from "react-spinners";

const DashboardLayout = () => {
  return (
    <div>
      <h1 className="text-5xl px-4 gradient-title mb-5 font-bold">Dashboard</h1>


    {/* Dashboard Page */}
      <Suspense fallback={<BarLoader className="mt-4 " width={"100%"} color="#008f39"/>}>
        <DashboardPage />
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
