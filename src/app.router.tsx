import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./auth/layout/AuthLayout";
import { ClinicaLayout } from "./clinica/layout/ClinicaLayout";
import LandingPage from "./clinica/pages/LandingPage";
import { NotAuthenticatedRoute } from "./components/routes/ProtectedRoutes";
import { RoleProtectedRoute } from "./components/routes/RoleProtectedRoute";
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
            <RoleProtectedRoute allowedRoles={[1, 2, 3, 4, 5]}>
                <AdminLayout />
            </RoleProtectedRoute>
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
                path: 'patients/register/new', // Crear (Admin y Recepción)
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 2]}>
                        <RegisterPatients />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'patients/edit/:id', // Editar (Admin y Recepción)
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 2]}>
                        <RegisterPatients />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'patients/:patientId/history', // Historial Clínico (Admin, Médico, Enfermero, Bioanalista)
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 3, 4, 5]}>
                        <PatientHistoryPage />
                    </RoleProtectedRoute>
                )
            },

            // --- Gestión de Citas ---
            {
                path: 'appointments/today', // Vista principal del Doctor (Solo Médico)
                element: (
                    <RoleProtectedRoute allowedRoles={[3]}>
                        <TodayAppointmentsPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'appointments/schedule', // Agendar (Admin y Recepción)
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 2]}>
                        <ScheduleAppointmentPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'appointments/availability',
                element: <DoctorAvailabilityPage />
            },

            // --- Consultas Médicas (Flujo de Trabajo) ---
            {
                // Esta es la ruta MAESTRA de la consulta.
                path: 'consultations/process/:appointmentId',
                element: (
                    <RoleProtectedRoute allowedRoles={[3]}>
                        <ActiveConsultationPage />
                    </RoleProtectedRoute>
                )
            },
            {
                // Ruta opcional: Para crear una consulta manual
                path: 'consultations/create',
                element: (
                    <RoleProtectedRoute allowedRoles={[3]}>
                        <CreateConsultationPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'consultations/history',
                element: (
                    <RoleProtectedRoute allowedRoles={[3]}>
                        <ConsultationHistoryPage />
                    </RoleProtectedRoute>
                )
            },

            // --- Laboratorio ---
            {
                path: 'laboratory/results',
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 5]}>
                        <RegisterResultsPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'laboratory/history',
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 5]}>
                        <ExamHistoryPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'laboratory/manage', // Catálogo de exámenes
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 5]}>
                        <ManageExamsPage />
                    </RoleProtectedRoute>
                )
            },

            // --- Facturación ---
            {
                path: 'billing/invoice',
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 2]}>
                        <GenerateInvoicePage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'billing/payments',
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 2]}>
                        <RegisterPaymentsPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'billing/close', // Cierre de caja
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 2]}>
                        <CashClosurePage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'billing/promotions',
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 2]}>
                        <PromotionsPage />
                    </RoleProtectedRoute>
                )
            },

            // --- Recursos Humanos ---
            {
                path: 'hr/employees',
                element: (
                    <RoleProtectedRoute allowedRoles={[1]}>
                        <EmployeesPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'hr/attendance',
                element: (
                    <RoleProtectedRoute allowedRoles={[1]}>
                        <AttendancePage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'hr/specialties',
                element: (
                    <RoleProtectedRoute allowedRoles={[1]}>
                        <SpecialtiesPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'hr/position',
                element: (
                    <RoleProtectedRoute allowedRoles={[1]}>
                        <PositionsPage />
                    </RoleProtectedRoute>
                )
            },

            // --- Reportes ---
            {
                path: 'reports',
                element: (
                    <RoleProtectedRoute allowedRoles={[1, 4]}>
                        <ReportsPage />
                    </RoleProtectedRoute>
                )
            },

            // --- Administración ---
            {
                path: 'admin/users',
                element: (
                    <RoleProtectedRoute allowedRoles={[1]}>
                        <UsersManagementPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'admin/audit',
                element: (
                    <RoleProtectedRoute allowedRoles={[1]}>
                        <AuditPage />
                    </RoleProtectedRoute>
                )
            },
            {
                path: 'admin/files',
                element: (
                    <RoleProtectedRoute allowedRoles={[1]}>
                        <DigitalFilesPage />
                    </RoleProtectedRoute>
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