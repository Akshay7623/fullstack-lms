import { Routes, Route } from "react-router-dom";
import { lazy } from "react";
import Loadable from "components/Loadable";
import ThemeCustomization from "themes";
import RTLLayout from "components/RTLLayout";
import ScrollTop from "components/ScrollTop";
import Courses from "./MyComponents/Courses.jsx";
import { EmailPreferenceProvider } from "./contexts/EmailPreferenceContext";

// import Locales from 'components/Locales';
// import Customization from 'components/Customization';
// import Snackbar from 'components/@extended/Snackbar';
// import Notistack from 'components/third-party/Notistack';
// import Metrics from 'metrics';

import { JWTProvider as AuthProvider } from "contexts/JWTContext";
import MainLayout from "MyComponents/Dashboard";
import { ConfigProvider } from "./contexts/ConfigContext";


// import Login from "./MyComponents/Login";
// import Trainers from "./MyComponents/Trainers";
// import AddTrainerPage from "./MyComponents/AddTrainer.jsx";
// import AddCourse from "./MyComponents/AddCourse.jsx";
// import TrainerPayment from "./MyComponents/TrainerPayment.jsx";
// import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';

const Student = Loadable(lazy(() => import("MyComponents/Student")));
const AddStudent = Loadable(lazy(() => import("MyComponents/AddStudent")));
const Login = Loadable(lazy(() => import("MyComponents/Login")));
const Trainers = Loadable(lazy(() => import("MyComponents/Trainers")));
const AddTrainerPage = Loadable(lazy(() => import("MyComponents/AddTrainer")));
const AddCourse = Loadable(lazy(() => import("MyComponents/AddCourse")));
const TrainerPayment = Loadable(
  lazy(() => import("MyComponents/TrainerPayment"))
);
const Transactions = Loadable(lazy(() => import("MyComponents/Transactions")));
const LatestTransactions = Loadable(
  lazy(() => import("MyComponents/LatestTransactions"))
);
const PendingEnrollments = Loadable(
  lazy(() => import("MyComponents/PendingEnrollments"))
);

const ActiveBatches = Loadable(
  lazy(() => import("MyComponents/batches/ActiveBatches"))
);
const BatchCalendar = Loadable(
  lazy(() => import("MyComponents/batches/BatchCalendar"))
);
const SemiActiveBatches = Loadable(
  lazy(() => import("MyComponents/batches/SemiActiveBatches"))
);
const ArchivedBatches = Loadable(
  lazy(() => import("MyComponents/batches/ArchivedBatches"))
);
const Settings = Loadable(lazy(() => import("MyComponents/Settings")));
const Fees = Loadable(lazy(() => import("MyComponents/Fees")));
const Module = Loadable(lazy(() => import("MyComponents/Module")));
const Home = Loadable(lazy(() => import("MyComponents/Home")));
const ViewSingleBatch = Loadable(lazy(() => import("MyComponents/batches/ViewSingleBatch")));


export default function App() {
  return (
    <>
      {/* <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <>
                  <Notistack>
                    <RouterProvider router={router} />
                    <Customization />
                    <Snackbar />
                  </Notistack>
                </>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
      <Metrics /> */}
      <ThemeCustomization>
        <EmailPreferenceProvider>
          <RTLLayout>
            <ScrollTop>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/contact" element={<div>Contact Page</div>} />
                  <Route path="/login" element={<Login />} />

                  <Route path="/student" element={<MainLayout />}>
                    <Route path="view" element={<Student />} />
                    <Route path="add" element={<AddStudent />} />
                    <Route
                      path="pending-enrollments"
                      element={<PendingEnrollments />}
                    />
                  </Route>

                  <Route path="/trainers" element={<MainLayout />}>
                    <Route path="list" element={<Trainers />} />
                    <Route path="add" element={<AddTrainerPage />} />
                    <Route path="trainer-payments" element={<TrainerPayment />} />
                    <Route path="module" element={<Module />} />
                  </Route>

                  <Route path="/courses" element={<MainLayout />}>
                    <Route index element={<Courses />} />
                    <Route path="add" element={<AddCourse />} />
                  </Route>

                  <Route path="/batches" element={<MainLayout />}>
                    {/* <Route index element={<ActiveBatches />} /> */}
                    <Route path="active" element={<ActiveBatches />} />
                    <Route path="semi-active" element={<SemiActiveBatches />} />
                    <Route path="archived" element={<ArchivedBatches />} />
                    <Route path="calendar" element={<BatchCalendar />} />
                    <Route path="view/:id" element={<ViewSingleBatch />} />
                  </Route>

                  <Route path="/transactions" element={<MainLayout />}>
                    <Route path="receipt" element={<Transactions />} />
                    <Route
                      path="latest-transaction"
                      element={<LatestTransactions />}
                    />
                  </Route>

                  <Route path="/fees" element={<Fees />} />

                  <Route path="/settings" element={<MainLayout />}>
                    <Route index element={<Settings />} />
                  </Route>


                </Routes>
              </AuthProvider>
            </ScrollTop>
          </RTLLayout>
        </EmailPreferenceProvider>
      </ThemeCustomization>
    </>
  );
}
