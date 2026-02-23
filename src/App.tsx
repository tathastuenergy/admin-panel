import {
  HashRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  // Outlet,
  // Navigate,
} from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Customer from "./pages/Customer/Customer";
import AddCustomer from "./pages/Customer/AddCustomer";
import Inventory from "./pages/Inventory/Inventory";
import AddInventory from "./pages/Inventory/AddInventory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Estimate from "./pages/Estimate/Estimate";
import AddEstimate from "./pages/Estimate/AddEstimate";
import Invoice from "./pages/Invoice/Invoice";
import AddInvoice from "./pages/Invoice/AddInvoice";
import EstimateView from "./pages/Estimate/EstimateView";
import InvoiceView from "./pages/Invoice/InvoiceView";
import AddPayment from "./pages/Payment/AddPayment";
import AddCompany from "./pages/Company/AddCompany";
import Payment from "./pages/Payment/Payment";
import StatementOfAccounts from "./pages/Customer/StatementOfAccounts";
import Settings from "./pages/Settings/Settings";
import { FormProvider } from "./pages/Context/FormContext";

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};

// ✅ Public route - redirects to / if already logged in
const PublicRoute = () => {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default function App() {
  return (
    <>
      <FormProvider>
        <Router>
          <ScrollToTop />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            style={{ marginTop: "60px" }}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
          />
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>
            {/* Dashboard Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Home />} />
                <Route index path="/customer" element={<Customer />} />
                <Route path="/customer/add" element={<AddCustomer />} />
                <Route path="/customer/edit/:id" element={<AddCustomer />} />
                <Route
                  path="/customer/:id/statement"
                  element={<StatementOfAccounts />}
                />

                <Route index path="/company/add" element={<AddCompany />} />

                <Route index path="/inventory" element={<Inventory />} />
                <Route path="/inventory/add" element={<AddInventory />} />
                <Route path="/inventory/edit/:id" element={<AddInventory />} />

                <Route index path="/estimate" element={<Estimate />} />
                <Route path="/estimate/add" element={<AddEstimate />} />
                <Route path="/estimate/edit/:id" element={<AddEstimate />} />
                <Route path="/estimate/view/:id" element={<EstimateView />} />
                {/* <Route path="/estimate/download/:id" element={<EstimateDownload />} /> */}

                <Route index path="/invoice" element={<Invoice />} />
                <Route path="/invoice/add" element={<AddInvoice />} />
                <Route path="/invoice/edit/:id" element={<AddInvoice />} />
                <Route path="/invoice/view/:id" element={<InvoiceView />} />

                {/* Payment */}
                <Route index path="/payment" element={<Payment />} />
                <Route path="/payment/add" element={<AddPayment />} />
                <Route path="/payment/edit/:id" element={<AddPayment />} />

                {/* Others Page */}
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/settings" element={<Settings />} />

                <Route path="/blank" element={<Blank />} />

                {/* Forms */}
                <Route path="/form-elements" element={<FormElements />} />

                {/* Tables */}
                <Route path="/basic-tables" element={<BasicTables />} />

                {/* Ui Elements */}
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
              </Route>
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </FormProvider>
    </>
  );
}
