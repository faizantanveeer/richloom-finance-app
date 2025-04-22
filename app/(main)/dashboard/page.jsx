"use client";
import React from "react";

import CreateAccountDrawer from "@/components/CreateAcountDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

const DashboardPage = () => {
  return (
    <div className="container mx-auto ">
      {/* Budget Progress */}

      {/* Account Overview */}

      {/* Account Grid*/}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
        <CreateAccountDrawer>
          <Card
            className={
              "hover:shadow-md transition-shadow cursor-pointer  h-full"
            }
          >
            <CardContent
              className={
                "flex flex-col text-muted-foreground h-full pt-5 justify-center items-center gap-2"
              }
            >
              <Plus className="h-10 w-10 mb-2" />
              Add Account
            </CardContent>
          </Card>
        </CreateAccountDrawer>
      </div>
    </div>
  );
};

export default DashboardPage;
