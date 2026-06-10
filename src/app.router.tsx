import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./auth/layout/AuthLayout";
import { ClinicaLayout } from "./clinica/layout/ClinicaLayout";
import LandingPage from "./clinica/pages/LandingPage";
import { NotAuthenticatedRoute } from "./components/routes/ProtectedRoutes";
import { PermissionProtectedRoute } from "./components/routes/PermissionProtectedRoute";
import { LoginPage } from "./auth/pages/LoginPage";
import { AdminLayout } from "./admin/layout/AdminLayout";
import DashboardPage from "./admin/pages/dashboard/DashboardPage";
import { SearchPatients } from "./admin/pages/patients/SearchPatients";
import { RegisterPatients } from "./admin/pages/patients/RegisterPatients";
import { PatientHistoryPage } from "./admin/pages/patients/PatientHistoryPage";
import { TodayAppointmentsPage } from "./admin/pages/appointments/TodayAppointmentsPage";
import { ScheduleAppointmentPage } from "./admin/pages/appointments/SchedulePage";
import { DoctorAvailabilityPage } from "./admin/pages/appointments/DoctorAvailabilityPage";
import CreateConsultationPage from "./admin/pages/consultations/CreateConsultationPage";
import ConsultationHistoryPage from "./admin/pages/consultations/ConsultationHistoryPage";
import { RegisterResultsPage } from "./admin/pages/laboratory/RegisterResultsPage";
import { ExamHistoryPage } from "./admin/pages/laboratory/ExamHistoryPage";
import { ManageExamsPage } from "./admin/pages/laboratory/ManageExamsPage";
import { GenerateInvoicePage } from "./admin/pages/billing/GenerateInvoicePage";
import { RegisterPaymentsPage } from "./admin/pages/billing/RegisterPaymentsPage";
import { CashClosurePage } from "./admin/pages/billing/CashClosurePage";
import { PromotionsPage } from "./admin/pages/billing/PromotionsPage";
import { EmployeesPage } from "./admin/pages/humanResources/EmployeesPage";
import { AttendancePage } from "./admin/pages/humanResources/AttendancePage";
import { SpecialtiesPage } from "./admin/pages/humanResources/SpecialtiesPage";
import { PositionsPage } from "./admin/pages/humanResources/PositionsPage";
import { ReportsPage } from "./admin/pages/reports/ReportsPage";
import UsersManagementPage from "./admin/pages/admin/UsersManagementPage";
import { ScheduleManagementPage } from "./admin/pages/schedules/ScheduleManagementPage";
import { AuditPage } from "./admin/pages/admin/AuditPage";
import { DigitalFilesPage } from "./admin/pages/admin/DigitalFilesPage";
import { PermissionsPage } from "./admin/pages/admin/PermissionsPage";
import { ActiveConsultationPage } from "./admin/pages/consultations/ActiveConsultationPage";
import { ForceChangePasswordPage } from "./auth/pages/ForceChangePasswordPage";
import { ResetPasswordPage } from "./auth/pages/ResetPasswordPage";
import { UserProfilePage } from "./admin/pages/profile/UserProfilePage";

export const appRouter = createBrowserRouter([
  // 1. Rutas Públicas (Landing Page)
  {
    path: '/',
    element: <ClinicaLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
    ]
  },

  // 2. Rutas de Autenticación (Login, Recuperar Pass)
  {
    path: '/auth',
    element: (
      <NotAuthenticatedRoute>
        <AuthLayout />
      </NotAuthenticatedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={'/auth/login'} />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />
      }
    ]
  },

  // 2.5 Ruta para forzar cambio de contraseña
  {
    path: '/auth/change-password',
    element: <ForceChangePasswordPage />
  },

  // 3. Rutas Privadas (Dashboard / Admin)
  {
    path: '/dashboard',
    element: (
      <PermissionProtectedRoute requiredPermission="Dashboard">
        <AdminLayout />
      </PermissionProtectedRoute>
    ),
    children: [
      // --- Home del Dashboard ---
      {
        index: true,
        element: <DashboardPage />
      },

      // --- Perfil del usuario ---
      {
        path: 'profile',
        element: <UserProfilePage />
      },

      // --- Gestión de Pacientes ---
      {
        path: 'patients/search',
        element: <SearchPatients />
      },
      {
        path: 'patients/register/new',
        element: (
          <PermissionProtectedRoute requiredPermission="Pacientes - Registrar">
            <RegisterPatients />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'patients/edit/:id',
        element: (
          <PermissionProtectedRoute requiredPermission="Pacientes - Registrar">
            <RegisterPatients />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'patients/:patientId/history',
        element: (
          <PermissionProtectedRoute requiredPermission="Pacientes - Historial de Paciente">
            <PatientHistoryPage />
          </PermissionProtectedRoute>
        )
      },

      // --- Gestión de Citas ---
      {
        path: 'appointments/today',
        element: (
          <PermissionProtectedRoute requiredPermission="Citas - Hoy">
            <TodayAppointmentsPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'appointments/schedule',
        element: (
          <PermissionProtectedRoute requiredPermission="Citas - Agendar">
            <ScheduleAppointmentPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'appointments/availability',
        element: <DoctorAvailabilityPage />
      },

      // --- Consultas Médicas (Flujo de Trabajo) ---
      {
        path: 'consultations/process/:appointmentId',
        element: (
          <PermissionProtectedRoute requiredPermission="Consultas - Activa">
            <ActiveConsultationPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'consultations/create',
        element: (
          <PermissionProtectedRoute requiredPermission="Consultas - Crear">
            <CreateConsultationPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'consultations/history',
        element: (
          <PermissionProtectedRoute requiredPermission="Consultas - Historial">
            <ConsultationHistoryPage />
          </PermissionProtectedRoute>
        )
      },

      // --- Laboratorio ---
      {
        path: 'laboratory/results',
        element: (
          <PermissionProtectedRoute requiredPermission="Laboratorio - Registrar Resultados">
            <RegisterResultsPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'laboratory/history',
        element: (
          <PermissionProtectedRoute requiredPermission="Laboratorio - Historial">
            <ExamHistoryPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'laboratory/manage',
        element: (
          <PermissionProtectedRoute requiredPermission="Laboratorio - Catálogo de Exámenes">
            <ManageExamsPage />
          </PermissionProtectedRoute>
        )
      },

      // --- Facturación ---
      {
        path: 'billing/invoice',
        element: (
          <PermissionProtectedRoute requiredPermission="Facturación - Factura">
            <GenerateInvoicePage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'billing/payments',
        element: (
          <PermissionProtectedRoute requiredPermission="Facturación - Pagos">
            <RegisterPaymentsPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'billing/close',
        element: (
          <PermissionProtectedRoute requiredPermission="Facturación - Cierre de caja">
            <CashClosurePage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'billing/promotions',
        element: (
          <PermissionProtectedRoute requiredPermission="Facturación - Promociones">
            <PromotionsPage />
          </PermissionProtectedRoute>
        )
      },

      // --- Recursos Humanos ---
      {
        path: 'hr/employees',
        element: (
          <PermissionProtectedRoute requiredPermission="Recursos Humanos - Empleados">
            <EmployeesPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'hr/attendance',
        element: (
          <PermissionProtectedRoute requiredPermission="Recursos Humanos - Asistencia">
            <AttendancePage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'hr/specialties',
        element: (
          <PermissionProtectedRoute requiredPermission="Recursos Humanos - Especialidades">
            <SpecialtiesPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'hr/position',
        element: (
          <PermissionProtectedRoute requiredPermission="Recursos Humanos - Cargos">
            <PositionsPage />
          </PermissionProtectedRoute>
        )
      },

      // --- Reportes ---
      {
        path: 'reports',
        element: (
          <PermissionProtectedRoute requiredPermission="Reportes">
            <ReportsPage />
          </PermissionProtectedRoute>
        )
      },

      // --- Administración ---
      {
        path: 'admin/users',
        element: (
          <PermissionProtectedRoute requiredPermission="Administración - Usuarios">
            <UsersManagementPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'admin/schedules',
        element: (
          <PermissionProtectedRoute requiredPermission="Administración - Horarios">
            <ScheduleManagementPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'admin/audit',
        element: (
          <PermissionProtectedRoute requiredPermission="Administración - Auditoría">
            <AuditPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'admin/files',
        element: (
          <PermissionProtectedRoute requiredPermission="Administración - Archivos Digitales">
            <DigitalFilesPage />
          </PermissionProtectedRoute>
        )
      },
      {
        path: 'admin/permissions',
        element: (
          <PermissionProtectedRoute requiredPermission="Administración - Usuarios">
            <PermissionsPage />
          </PermissionProtectedRoute>
        )
      }
    ]
  },

  // Fallback: Redirigir a dashboard si la ruta no existe
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);