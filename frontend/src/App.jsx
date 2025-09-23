import { Routes, Route } from "react-router-dom";
import { lazy } from "react";
import Loadable from "components/Loadable";
import ThemeCustomization from "themes";
import RTLLayout from "components/RTLLayout";
import ScrollTop from "components/ScrollTop";
import PrivateRoute from "components/PrivateRoute";
import Courses from "./MyComponents/Courses.jsx";
import { EmailPreferenceProvider } from "./contexts/EmailPreferenceContext";

// import Locales from 'components/Locales';
// import Customization from 'components/Customization';
// import Snackbar from 'components/@extended/Snackbar';
// import Notistack from 'components/third-party/Notistack';
// import Metrics from 'metrics';

import { JWTProvider as AuthProvider } from "contexts/JWTContext";
import MainLayout from "MyComponents/Dashboard";

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
                    <Route
                      path="view"
                      element={
                        <PrivateRoute>
                          <Student />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="add"
                      element={
                        <PrivateRoute>
                          <AddStudent />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="pending-enrollments"
                      element={
                        <PrivateRoute>
                          <PendingEnrollments />
                        </PrivateRoute>
                      }
                    />
                  </Route>

                  <Route path="/trainers" element={<MainLayout />}>
                    <Route path="list" element={<PrivateRoute><Trainers /></PrivateRoute>} />
                    <Route path="add" element={<PrivateRoute><AddTrainerPage /></PrivateRoute>} />
                    <Route path="trainer-payments" element={<PrivateRoute><TrainerPayment /></PrivateRoute>} />
                    <Route path="module" element={<PrivateRoute><Module /></PrivateRoute>} />
                  </Route>

                  <Route path="/courses" element={<MainLayout />}>
                    <Route index element={<PrivateRoute><Courses /></PrivateRoute>} />
                    <Route path="add" element={<PrivateRoute><AddCourse /></PrivateRoute>} />
                  </Route>

                  <Route path="/batches" element={<MainLayout />}>
                    <Route path="active" element={<PrivateRoute><ActiveBatches /></PrivateRoute>} />
                    <Route path="semi-active" element={<PrivateRoute><SemiActiveBatches /></PrivateRoute>} />
                    <Route path="archived" element={<PrivateRoute><ArchivedBatches /></PrivateRoute>} />
                    <Route path="calendar" element={<PrivateRoute><BatchCalendar /></PrivateRoute>} />
                    <Route path="view/:id" element={<PrivateRoute><ViewSingleBatch /></PrivateRoute>} />
                  </Route>

                  <Route path="/transactions" element={<MainLayout />}>
                    <Route path="receipt" element={<PrivateRoute><Transactions /></PrivateRoute>} />
                    <Route
                      path="latest-transaction"
                      element={<PrivateRoute><LatestTransactions /></PrivateRoute>}
                    />
                  </Route>

                  <Route path="/fees" element={<PrivateRoute><Fees /></PrivateRoute>} />

                  <Route path="/settings" element={<MainLayout />}>
                    <Route index element={<PrivateRoute><Settings /></PrivateRoute>} />
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
