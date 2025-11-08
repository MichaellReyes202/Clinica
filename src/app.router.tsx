import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./auth/layout/AuthLayout";
import { LoginPage } from "./auth/pages/LoginPage";
import LandingPage from "./clinica/pages/LandingPage";
import { ClinicaLayout } from "./clinica/layout/ClinicaLayout";
import { AdminLayout } from "./admin/layout/AdminLayout";
import { RegisterPatients } from "./admin/pages/patients/RegisterPatients";
import { SearchPatients } from "./admin/pages/patients/SearchPatients";
import { ScheduleAppointmentPage } from "./admin/pages/appointments/SchedulePage";
import { DoctorAvailabilityPage } from "./admin/pages/appointments/DoctorAvailabilityPage";
import { TodayAppointmentsPage } from "./admin/pages/appointments/TodayAppointmentsPage";
import CreateConsultationPage from "./admin/pages/consultations/CreateConsultationPage";
import { ConsultationNotesPage } from "./admin/pages/consultations/ConsultationNotesPage";
import PrescriptionPage from "./admin/pages/consultations/PrescriptionPage";
import { PrescribeExamsPage } from "./admin/pages/consultations/PrescribeExamsPage";
import { RegisterResultsPage } from "./admin/pages/laboratory/RegisterResultsPage";
import { ExamHistoryPage } from "./admin/pages/laboratory/ExamHistoryPage";
import { ManageExamsPage } from "./admin/pages/laboratory/ManageExamsPage";
import { GenerateInvoicePage } from "./admin/pages/billing/GenerateInvoicePage";
import { RegisterPaymentsPage } from "./admin/pages/billing/RegisterPaymentsPage";
import { CashClosurePage } from "./admin/pages/billing/CashClosurePage";
import { PromotionsPage } from "./admin/pages/billing/PromotionsPage";
import { AttendancePage } from "./admin/pages/humanResources/AttendancePage";
import { EmployeesPage } from "./admin/pages/humanResources/EmployeesPage";
import { SpecialtiesPage } from "./admin/pages/humanResources/SpecialtiesPage";
import PatientReportsPage from "./admin/pages/reports/PatientReportsPage";
import { FinancialReportsPage } from "./admin/pages/reports/FinancialReportsPage";
import { AttendanceReportsPage } from "./admin/pages/reports/AttendanceReportsPage";
import UsersManagementPage from "./admin/pages/admin/UsersManagementPage";
import { AuditPage } from "./admin/pages/admin/AuditPage";
import { DigitalFilesPage } from "./admin/pages/admin/DigitalFilesPage";
import DashboardPage from "./admin/pages/dashboard/DashboardPage";
import { AdminRoute, NotAuthenticatedRoute } from "./components/routes/ProtectedRoutes";
import { PositionsPage } from "./admin/pages/humanResources/PositionsPage";




export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <ClinicaLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'especialidad/:exam'
      }
    ]
  },
  // auth routes 
  {
    path: '/auth',
    element: <NotAuthenticatedRoute> <AuthLayout /></NotAuthenticatedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to={'/auth/login'} />
      },
      {
        path: 'login',
        element: <LoginPage />
      }
    ]
  },
  // Admin routes 
  {
    path: '/dashboard',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      // Pacientes
      {
        path: 'patients/register/:id',
        element: <RegisterPatients />
      },
      {
        path: 'patients/search',
        element: <SearchPatients />
      },

      // Citas
      {
        path: 'appointments/schedule',
        element: <ScheduleAppointmentPage />
      }, {
        path: 'appointments/availability',
        element: <DoctorAvailabilityPage />
      },
      {
        path: 'appointments/today',
        element: <TodayAppointmentsPage />
      },

      // "Consultas Médicas"
      {
        path: 'consultations/create',
        element: <CreateConsultationPage />
      },
      {
        path: 'consultations/notes',
        element: <ConsultationNotesPage />
      },
      {
        path: 'consultations/prescription',
        element: <PrescriptionPage />
      },
      {
        path: 'consultations/exams',
        element: <PrescribeExamsPage />
      },

      // Laboratorio
      {
        path: 'laboratory/results',
        element: <RegisterResultsPage />
      },
      {
        path: 'laboratory/history',
        element: <ExamHistoryPage />
      },
      {
        path: 'laboratory/manage',
        element: <ManageExamsPage />
      },

      //  Farmacia
      // {
      //   path: 'pharmacy/inventory',
      //   element: <PharmacyInventoryPage />
      // },
      // {
      //   path: 'pharmacy/alerts',
      //   element: <PharmacyAlertsPage />
      // },
      // {
      //   path: 'pharmacy/supplies',
      //   element: <PharmacySuppliesPage />
      // },

      // Facturación y Caja
      {
        path: 'billing/invoice',
        element: <GenerateInvoicePage />
      },
      {
        path: 'billing/payments',
        element: <RegisterPaymentsPage />
      },
      {
        path: 'billing/close',
        element: <CashClosurePage />
      },
      {
        path: 'billing/promotions',
        element: <PromotionsPage />
      },

      // Recursos Humanos
      {
        path: 'hr/attendance',
        element: <AttendancePage />
      },
      {
        path: 'hr/employees',
        element: <EmployeesPage />
      },
      {
        path: 'hr/specialties',
        element: <SpecialtiesPage />
      },
      {
        path: 'hr/position',
        element: <PositionsPage />
      },

      // Reportes
      {
        path: 'reports/patients',
        element: <PatientReportsPage />
      },
      {
        path: 'reports/financial',
        element: <FinancialReportsPage />
      },
      {
        path: 'reports/attendance',
        element: <AttendanceReportsPage />
      },

      // Administración
      {
        path: 'admin/users',
        element: <UsersManagementPage />
      },
      {
        path: 'admin/audit',
        element: <AuditPage />
      },
      {
        path: 'admin/files',
        element: <DigitalFilesPage />
      }

    ]
  }
])