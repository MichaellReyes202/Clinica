import React, { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";


import { Menu, X, ChevronRight, ChevronLeft, Phone, Mail, MapPin, Stethoscope, FlaskConical, Percent, type LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Validation schema for contact form
const contactSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(8, "Teléfono inválido"),
    message: z.string().min(1, "El mensaje es requerido"),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Interfaces for sample data
interface Specialty {
    id: number;
    name: string;
    description: string;
    icon: LucideIcon;
}

interface Exam {
    id: number;
    name: string;
    description: string;
    price: number;
    icon: LucideIcon;
}

interface Promotion {
    id: number;
    title: string;
    description: string;
    cta: string;
}

interface Stat {
    value: number;
    label: string;
}

interface HeroImage {
    id: number;
    src: string;
    alt: string;
}

// Sample data (replace with API calls in production)
const specialties: Specialty[] = [
    { id: 1, name: "Medicina General", description: "Atención primaria para todas las edades", icon: Stethoscope },
    { id: 2, name: "Cardiología", description: "Diagnóstico y tratamiento de afecciones cardíacas", icon: Stethoscope },
    { id: 3, name: "Pediatría", description: "Cuidado especializado para niños", icon: Stethoscope },
    { id: 4, name: "Ginecología", description: "Atención integral para la salud femenina", icon: Stethoscope },
];

const exams: Exam[] = [
    { id: 1, name: "Examen de Sangre", description: "Análisis completo de laboratorio", price: 50, icon: FlaskConical },
    { id: 2, name: "Ultrasonido", description: "Imágenes diagnósticas de alta calidad", price: 80, icon: FlaskConical },
    { id: 3, name: "Radiografía", description: "Imágenes para diagnóstico óseo", price: 60, icon: FlaskConical },
    { id: 4, name: "Electrocardiograma", description: "Evaluación de la actividad cardíaca", price: 40, icon: FlaskConical },
];

const promotions: Promotion[] = [
    { id: 1, title: "20% Descuento en Consultas", description: "Válido para Medicina General este mes", cta: "Agendar Ahora" },
    { id: 2, title: "Paquete Familiar", description: "Consulta + Examen de Sangre con 15% off", cta: "Reservar" },
    { id: 3, title: "Chequeo Anual", description: "Evaluación completa con 10% descuento", cta: "Agendar Ahora" },
];

// Sample hero images (replace with actual image URLs in production)
const heroImages: HeroImage[] = [
    { id: 1, src: "https://via.placeholder.com/1920x1080?text=Clinica+1", alt: "Clínica moderna" },
    { id: 2, src: "https://via.placeholder.com/1920x1080?text=Consulta+Medica", alt: "Consulta médica" },
    { id: 3, src: "https://via.placeholder.com/1920x1080?text=Equipo+Medico", alt: "Equipo médico" },
];

// Carousel Component


interface CarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
}

const Carousel = <T,>({ items, renderItem }: CarouselProps<T>) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const itemsPerView = {
        mobile: 1,
        desktop: 3,
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - itemsPerView.desktop : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= items.length - itemsPerView.desktop ? 0 : prev + 1));
    };

    return (
        <div className="relative">
            <div className="overflow-hidden" ref={containerRef}>
                <motion.div
                    className="flex"
                    animate={{ x: `-${currentIndex * (100 / itemsPerView.desktop)}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="shrink-0 w-full sm:w-1/2 lg:w-1/3 px-2"
                        >
                            {renderItem(item, index)}
                        </div>
                    ))}
                </motion.div>
            </div>
            <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handlePrev}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handleNext}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: Math.ceil(items.length / itemsPerView.desktop) }).map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 w-2 rounded-full ${index === Math.floor(currentIndex / itemsPerView.desktop) ? "bg-blue-600" : "bg-gray-300"}`}
                        onClick={() => setCurrentIndex(index * itemsPerView.desktop)}
                    />
                ))}
            </div>
        </div>
    );
};

// Header Component
const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const navLinks: { name: string; href: string }[] = [
        { name: "Inicio", href: "#home" },
        { name: "Especialidades", href: "#specialties" },
        { name: "Exámenes", href: "#exams" },
        { name: "Promociones", href: "#promotions" },
        { name: "Nosotros", href: "#about" },
        { name: "Contacto", href: "#contact" },
    ];

    return (
        <motion.header
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50"
        >
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <a href="/" className="text-2xl font-bold text-blue-600">Oficentro Masaya</a>
                <nav className="hidden md:flex space-x-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:underline"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700">
                        <a href="/auth/login">Iniciar Sesión</a>
                    </Button>
                </nav>
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownMenuTrigger className="md:hidden">
                        <Button variant="ghost" size="icon">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        {navLinks.map((link) => (
                            <DropdownMenuItem key={link.name} asChild>
                                <a href={link.href} className="text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                                    {link.name}
                                </a>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem asChild>
                            <Button asChild variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                                <a href="/login" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</a>
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
};

// Hero Component with Image Carousel
const Hero: React.FC = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Auto-advance images every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
            <AnimatePresence>
                <motion.div
                    key={currentImageIndex}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImages[currentImageIndex].src})` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                >
                    <div className="absolute inset-0 bg-black/30" /> {/* Overlay for better text readability */}
                </motion.div>
            </AnimatePresence>
            <div className="container mx-auto px-4 text-center relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl font-bold text-white mb-4"
                >
                    Oficentro Masaya - Cuidando Tu Salud con Excelencia
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-white mb-6"
                >
                    Servicios médicos especializados con atención personalizada
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center space-x-4"
                >
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-transform">
                        <a href="/login">Iniciar Sesión</a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                        <a href="#contact">Contáctanos</a>
                    </Button>
                </motion.div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                {
                    heroImages.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
            </div>
        </section>
    );
};

// Specialties Component
const Specialties: React.FC = () => (
    <section id="specialties" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-center text-gray-800 mb-8"
            >
                Nuestras Especialidades
            </motion.h2>
            <Carousel
                items={specialties}
                renderItem={(specialty: Specialty, index: number) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <specialty.icon className="h-8 w-8 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800">{specialty.name}</h3>
                            <p className="text-gray-600">{specialty.description}</p>
                        </Card>
                    </motion.div>
                )}
            />
        </div>
    </section>
);

// Exams Component
const Exams: React.FC = () => (
    <section id="exams" className="py-16">
        <div className="container mx-auto px-4">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-center text-gray-800 mb-8"
            >
                Exámenes Disponibles
            </motion.h2>
            <Carousel
                items={exams}
                renderItem={(exam: Exam, index: number) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <exam.icon className="h-8 w-8 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800">{exam.name}</h3>
                            <p className="text-gray-600">{exam.description}</p>
                            <p className="text-blue-600 font-semibold mt-2">${exam.price}</p>
                        </Card>
                    </motion.div>
                )}
            />
        </div>
    </section>
);

// Promotions Component
const Promotions: React.FC = () => (
    <section id="promotions" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-center text-gray-800 mb-8"
            >
                Promociones Especiales
            </motion.h2>
            <Carousel
                items={promotions}
                renderItem={(promo: Promotion, index: number) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <Percent className="h-8 w-8 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800">{promo.title}</h3>
                            <p className="text-gray-600">{promo.description}</p>
                            <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
                                <a href="#contact">{promo.cta}</a>
                            </Button>
                        </Card>
                    </motion.div>
                )}
            />
        </div>
    </section>
);

// About Component (Mission & Vision)
const About: React.FC = () => (
    <section id="about" className="py-16">
        <div className="container mx-auto px-4">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-center text-gray-800 mb-8"
            >
                Sobre Nosotros
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Misión</h3>
                    <p className="text-gray-600">
                        Proveer atención médica de calidad con procesos eficientes, personalizados y centrados en el paciente.
                    </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Visión</h3>
                    <p className="text-gray-600">
                        Ser la clínica líder en servicios médicos integrales en la región, con tecnología avanzada y excelencia.
                    </p>
                </motion.div>
            </div>
        </div>
    </section>
);

// Statistics Component
const Statistics: React.FC = () => {
    const stats: Stat[] = [
        { value: 500, label: "Pacientes Atendidos" },
        { value: 10, label: "Especialidades" },
        { value: 98, label: "Satisfacción (%)" },
    ];

    return (
        <section id="statistics" className="py-16 bg-blue-600 text-white">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-center mb-8"
                >
                    Nuestros Logros
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => {
                        const count = useMotionValue(0);
                        const rounded = useTransform(count, (value) => Math.round(value));


                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="text-center"
                            >
                                <motion.div className="text-4xl font-bold">
                                    <motion.span>{rounded}</motion.span>+
                                </motion.div>
                                <p className="text-lg">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// Learn More Component
const LearnMore: React.FC = () => (
    <section id="learn-more" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-gray-800 mb-4"
            >
                Saber Más
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-gray-600 mb-6"
            >
                Descubre nuestra amplia gama de servicios médicos, desde consultas especializadas hasta exámenes de diagnóstico y venta de medicamentos.
            </motion.p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-transform">
                <a href="#specialties">Descubre Nuestros Servicios</a>
            </Button>
        </div>
    </section>
);

// Location Component
const Location: React.FC = () => (
    <section id="location" className="py-16">
        <div className="container mx-auto px-4">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-center text-gray-800 mb-8"
            >
                Dónde Estamos
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <Card className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Nuestra Ubicación</h3>
                        <p className="text-gray-600 mb-2"><MapPin className="inline h-5 w-5 mr-2" /> Masaya, Nicaragua, Carretera Principal</p>
                        <p className="text-gray-600 mb-2"><Phone className="inline h-5 w-5 mr-2" /> +505 5555-1234</p>
                        <p className="text-gray-600 mb-4"><Mail className="inline h-5 w-5 mr-2" /> contacto@oficentro.com</p>
                        <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Obtener Direcciones</a>
                        </Button>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="h-64 md:h-auto"
                >
                    <div className="bg-gray-200 h-full rounded-lg flex items-center justify-center">
                        {/* Placeholder for Google Maps iframe */}
                        <p className="text-gray-600">Mapa de Google (Placeholder)</p>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

// Contact Component
const Contact: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (_data: ContactFormData) => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <section id="contact" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-center text-gray-800 mb-8"
                >
                    Contáctanos
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Información de Contacto</h3>
                            <p className="text-gray-600 mb-2"><Phone className="inline h-5 w-5 mr-2" /> +505 5555-1234</p>
                            <p className="text-gray-600 mb-2"><Mail className="inline h-5 w-5 mr-2" /> contacto@oficentro.com</p>
                            <p className="text-gray-600"><MapPin className="inline h-5 w-5 mr-2" /> Masaya, Nicaragua</p>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <Card className="p-6">
                            <AnimatePresence>
                                {isSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center"
                                    >
                                        <h3 className="text-xl font-semibold text-green-600">¡Mensaje Enviado!</h3>
                                        <p className="text-gray-600">Te contactaremos pronto.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Nombre</Label>
                                            <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
                                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Correo Electrónico</Label>
                                            <Input id="email" type="email" {...register("email")} className={errors.email ? "border-red-500" : ""} />
                                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Teléfono</Label>
                                            <Input id="phone" {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
                                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="message">Mensaje</Label>
                                            <Input id="message" {...register("message")} className={errors.message ? "border-red-500" : ""} />
                                            {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                                            {isSubmitting ? "Enviando..." : "Enviar"}
                                        </Button>
                                    </form>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// Footer Component
const Footer: React.FC = () => (
    <footer className="py-8 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Oficentro Masaya</h3>
                    <p className="text-gray-400">Tu salud, nuestra prioridad.</p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Enlaces Rápidos</h3>
                    <ul className="space-y-2">
                        {["Inicio", "Especialidades", "Exámenes", "Promociones", "Nosotros", "Contacto"].map((link) => (
                            <li key={link}>
                                <a href={`#${link.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors">
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Redes Sociales</h3>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Mail className="h-6 w-6" /></a>
                    </div>
                </div>
            </div>
            <p className="text-center text-gray-400 mt-8">© 2025 Oficentro Masaya. Todos los derechos reservados.</p>
        </div>
    </footer>
);

// ScrollToTop Component
const ScrollToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed bottom-4 right-4"
                >
                    <Button asChild variant="outline" size="icon" className="bg-blue-600 text-white hover:bg-blue-700">
                        <a href="#home"><ChevronRight className="h-6 w-6 -rotate-90" /></a>
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Main LandingPage Component
const LandingPage: React.FC = () => {
    useEffect(() => {
        // Enable smooth scrolling
        document.documentElement.style.scrollBehavior = "smooth";
    }, []);

    return (
        <div className="font-sans">
            <Header />
            <main>
                <Hero />
                <Specialties />
                <Exams />
                <Promotions />
                <About />
                <Statistics />
                <LearnMore />
                <Location />
                <Contact />
            </main>
            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default LandingPage;
// 