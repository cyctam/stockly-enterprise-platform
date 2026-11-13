import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full">
        <CardBody>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-lg font-semibold">
              404
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Page not found
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              The page you requested could not be located. Check the URL or return
              to the dashboard to continue.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard">
                <Button>Back to dashboard</Button>
              </Link>
              <Link to="/materials">
                <Button variant="secondary">View materials</Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
