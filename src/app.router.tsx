import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./auth/layout/AuthLayout";
import { ClinicaLayout } from "./clinica/layout/ClinicaLayout";
import LandingPage from "./clinica/pages/LandingPage";
import { AdminRoute, NotAuthenticatedRoute } from "./components/routes/ProtectedRoutes";
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
import PatientReportsPage from "./admin/pages/reports/PatientReportsPage";
import { FinancialReportsPage } from "./admin/pages/reports/FinancialReportsPage";
import { AttendanceReportsPage } from "./admin/pages/reports/AttendanceReportsPage";
import UsersManagementPage from "./admin/pages/admin/UsersManagementPage";
import { AuditPage } from "./admin/pages/admin/AuditPage";
import { DigitalFilesPage } from "./admin/pages/admin/DigitalFilesPage";
import { ActiveConsultationPage } from "./admin/pages/consultations/ActiveConsultationPage";


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
            // Ejemplo: Ver resultado de examen público por código
            // { path: 'resultados/:codigo', element: <PublicResultView /> }
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
            }
        ]
    },

    // 3. Rutas Privadas (Dashboard / Admin)
    {
        path: '/dashboard',
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            // --- Home del Dashboard ---
            {
                index: true,
                element: <DashboardPage />
            },

            // --- Gestión de Pacientes ---
            {
                path: 'patients/search',
                element: <SearchPatients />
            },
            {
                path: 'patients/register/new', // Crear
                element: <RegisterPatients />
            },
            {
                path: 'patients/edit/:id', // Editar (Parametrizado)
                element: <RegisterPatients />
            },
            {
                path: 'patients/:patientId/history', // Historial Clínico Completo
                element: <PatientHistoryPage />
            },

            // --- Gestión de Citas ---
            {
                path: 'appointments/today', // Vista principal del Doctor
                element: <TodayAppointmentsPage />
            },
            {
                path: 'appointments/schedule', // Agendar (Secretaria/Doctor)
                element: <ScheduleAppointmentPage />
            },
            {
                path: 'appointments/availability',
                element: <DoctorAvailabilityPage />
            },

            // --- Consultas Médicas (Flujo de Trabajo) ---
            {
                // Esta es la ruta MAESTRA de la consulta.
                // Aquí unificarás: Notas, Signos Vitales, Recetas y Exámenes en Tabs.
                path: 'consultations/process/:appointmentId',
                element: <ActiveConsultationPage />
            },
            {
                // Ruta opcional: Para crear una consulta manual si llega un paciente
                // de emergencia sin cita previa agendada formalmente.
                path: 'consultations/create',
                element: <CreateConsultationPage />
            },

            // NOTA: He eliminado las rutas sueltas de 'consultations/notes', 'prescription', etc.
            // Porque ahora viven DENTRO de 'ActiveConsultationPage' mediante Tabs.

            // --- Laboratorio ---
            {
                path: 'laboratory/results',
                element: <RegisterResultsPage />
            },
            {
                path: 'laboratory/history',
                element: <ExamHistoryPage />
            },
            {
                path: 'laboratory/manage', // Catálogo de exámenes
                element: <ManageExamsPage />
            },

            // --- Facturación ---
            {
                path: 'billing/invoice',
                element: <GenerateInvoicePage />
            },
            {
                path: 'billing/payments',
                element: <RegisterPaymentsPage />
            },
            {
                path: 'billing/close', // Cierre de caja
                element: <CashClosurePage />
            },
            {
                path: 'billing/promotions',
                element: <PromotionsPage />
            },

            // --- Recursos Humanos ---
            {
                path: 'hr/employees',
                element: <EmployeesPage />
            },
            {
                path: 'hr/attendance',
                element: <AttendancePage />
            },
            {
                path: 'hr/specialties',
                element: <SpecialtiesPage />
            },
            {
                path: 'hr/position',
                element: <PositionsPage />
            },

            // --- Reportes ---
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

            // --- Administración ---
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
    },

    // Fallback: Redirigir a dashboard si la ruta no existe
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />
    }
]);