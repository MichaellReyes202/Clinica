import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, MapPin, Stethoscope, Percent, Activity, Heart, Clock, Shield, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- Validation Schema ---
const contactSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(8, "Teléfono inválido"),
    message: z.string().min(10, "El mensaje debe ser más detallado"),
});

type ContactFormData = z.infer<typeof contactSchema>;

// --- Data Interfaces ---
interface Specialty {
    id: number;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

interface Promotion {
    id: number;
    title: string;
    description: string;
    cta: string;
    gradient: string;
}

interface Stat {
    value: number;
    label: string;
    icon: React.ElementType;
}

// --- Sample Data ---
const specialties: Specialty[] = [
    { id: 1, name: "Medicina General", description: "Atención integral y preventiva para toda la familia.", icon: Stethoscope, color: "text-blue-500" },
    { id: 2, name: "Cardiología", description: "Cuidado experto para la salud de tu corazón.", icon: Heart, color: "text-red-500" },
    { id: 3, name: "Pediatría", description: "Atención especializada para el desarrollo de tus hijos.", icon: Star, color: "text-yellow-500" },
    { id: 4, name: "Ginecología", description: "Salud y bienestar integral para la mujer.", icon: Activity, color: "text-pink-500" },
];

const promotions: Promotion[] = [
    { id: 1, title: "20% OFF Consultas", description: "Descuento especial en medicina general.", cta: "Reservar", gradient: "from-blue-500 to-cyan-400" },
    { id: 2, title: "Pack Familiar", description: "Consulta + Exámenes con 15% de descuento.", cta: "Ver Más", gradient: "from-purple-500 to-pink-500" },
    { id: 3, title: "Chequeo Anual", description: "Tu salud es primero, preventivo completo.", cta: "Agendar", gradient: "from-emerald-500 to-teal-400" },
];

const heroImages = [
    { id: 1, src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920", alt: "Modern Clinic Hall" },
    { id: 2, src: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1920", alt: "Doctor Consultation" },
    { id: 3, src: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1920", alt: "Medical Team" },
];

// --- Components ---

// 1. Modern Header
const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Inicio", href: "#home" },
        { name: "Especialidades", href: "#specialties" },
        { name: "Servicios", href: "#exams" },
        { name: "Nosotros", href: "#about" },
    ];

    return (
        <motion.header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <a href="#" className={`text-2xl font-bold tracking-tighter flex items-center gap-2 ${isScrolled ? "text-slate-800" : "text-white"}`}>
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    Oficentro<span className="text-blue-600">Masaya</span>
                </a>

                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-blue-500 ${isScrolled ? "text-slate-600" : "text-white/90 hover:text-white"
                                }`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 px-6">
                        <a href="/auth/login">Portal Paciente</a>
                    </Button>
                </nav>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={isScrolled ? "text-slate-800" : "text-white"}>
                                {isMenuOpen ? <X /> : <Menu />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-4 rounded-xl shadow-xl border-none bg-white/95 backdrop-blur-lg">
                            {navLinks.map((link) => (
                                <DropdownMenuItem key={link.name} asChild className="py-3 cursor-pointer">
                                    <a href={link.href} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-700">
                                        {link.name}
                                    </a>
                                </DropdownMenuItem>
                            ))}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <Button asChild className="w-full rounded-full bg-blue-600">
                                    <a href="/auth/login">Iniciar Sesión</a>
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.header>
    );
};

// 2. Immersive Hero
const Hero: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Carousel */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <img src={heroImages[index].src} alt={heroImages[index].alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 pt-20">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold mb-6 border border-blue-500/30">
                            Excelencia Médica Certificada
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                            Tu Salud es Nuestra <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                Prioridad Absoluta
                            </span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                            Experimenta una atención médica de clase mundial con tecnología de vanguardia y un equipo de especialistas dedicados a tu bienestar integral.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-lg px-8 h-14 shadow-lg shadow-blue-600/30">
                                <a href="#contact">Agendar Cita Ahora</a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14 backdrop-blur-sm">
                                <a href="#specialties">Explorar Servicios</a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
            </motion.div>
        </section>
    );
};

// 3. Modern Specialties Grid
const Specialties: React.FC = () => {
    return (
        <section id="specialties" className="py-24 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Especialidades Médicas</h2>
                    <p className="text-slate-600 text-lg">Un equipo multidisciplinario listo para atenderte con los más altos estándares de calidad.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {specialties.map((spec, idx) => (
                        <motion.div
                            key={spec.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                                    <div className={`p-4 rounded-2xl bg-slate-50 mb-6 group-hover:scale-110 transition-transform duration-300 ${spec.color.replace('text-', 'bg-').replace('500', '100')}`}>
                                        <spec.icon className={`h-8 w-8 ${spec.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{spec.name}</h3>
                                    <p className="text-slate-500 leading-relaxed">{spec.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// 4. Stats Section with Parallax feel
const Statistics: React.FC = () => {
    const stats: Stat[] = [
        { value: 1500, label: "Pacientes Felices", icon: Heart },
        { value: 25, label: "Especialistas", icon: Stethoscope },
        { value: 15, label: "Años de Experiencia", icon: Clock },
        { value: 100, label: "Calidad Garantizada", icon: Shield },
    ];

    return (
        <section className="py-20 bg-blue-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, type: "spring" }}
                            className="text-center"
                        >
                            <stat.icon className="h-10 w-10 text-blue-300 mx-auto mb-4 opacity-80" />
                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}+</h3>
                            <p className="text-blue-200 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// 5. Promotions Carousel (Modern)
const Promotions: React.FC = () => {
    return (
        <section id="promotions" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Promociones Vigentes</h2>
                        <p className="text-slate-600">Aprovecha nuestros paquetes especiales de salud.</p>
                    </div>
                    <Button variant="ghost" className="hidden md:flex text-blue-600 hover:text-blue-700">
                        Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {promotions.map((promo, idx) => (
                        <motion.div
                            key={promo.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            whileHover={{ y: -5 }}
                            className="relative group"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient} rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
                            <Card className="relative h-full border-none bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className={`h-2 w-full bg-gradient-to-r ${promo.gradient}`} />
                                <CardContent className="p-8">
                                    <div className="mb-4 inline-flex items-center justify-center p-3 rounded-full bg-slate-50">
                                        <Percent className="h-6 w-6 text-slate-700" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{promo.title}</h3>
                                    <p className="text-slate-500 mb-8">{promo.description}</p>
                                    <Button className={`w-full rounded-full bg-gradient-to-r ${promo.gradient} border-none shadow-md hover:shadow-lg transition-all`}>
                                        {promo.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// 6. Contact Section with Glass Form
const Contact: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <section id="contact" className="py-24 bg-slate-50 relative">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Estamos aquí para ayudarte</h2>
                        <p className="text-lg text-slate-600 mb-8">
                            ¿Tienes preguntas o necesitas agendar una cita? Nuestro equipo está listo para atenderte.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Phone, title: "Llámanos", text: "+505 2522-0000", sub: "Lunes a Sábado, 8am - 6pm" },
                                { icon: Mail, title: "Escríbenos", text: "citas@oficentro.com", sub: "Respondemos en menos de 24h" },
                                { icon: MapPin, title: "Visítanos", text: "Oficentro Masaya, Km 29", sub: "Carretera a Masaya" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-colors">
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                                        <p className="text-blue-600 font-medium">{item.text}</p>
                                        <p className="text-sm text-slate-500">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                            <CardContent className="p-8 md:p-10">
                                <AnimatePresence mode="wait">
                                    {isSubmitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Mensaje Enviado!</h3>
                                            <p className="text-slate-600">Nos pondremos en contacto contigo a la brevedad.</p>
                                            <Button
                                                variant="outline"
                                                className="mt-8 rounded-full"
                                                onClick={() => setIsSubmitted(false)}
                                            >
                                                Enviar otro mensaje
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Envíanos un mensaje</h3>
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nombre Completo</Label>
                                                <Input id="name" {...register("name")} className="rounded-lg border-slate-200 focus:border-blue-500 h-12" placeholder="Tu nombre" />
                                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input id="email" {...register("email")} className="rounded-lg border-slate-200 h-12" placeholder="correo@ejemplo.com" />
                                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Teléfono</Label>
                                                    <Input id="phone" {...register("phone")} className="rounded-lg border-slate-200 h-12" placeholder="8888-8888" />
                                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Mensaje</Label>
                                                <Textarea id="message" {...register("message")} className="rounded-lg border-slate-200 min-h-[120px]" placeholder="¿En qué podemos ayudarte?" />
                                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                                            </div>
                                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-medium shadow-lg shadow-blue-600/20">
                                                {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                                            </Button>
                                        </form>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// 7. Minimal Footer
const Footer: React.FC = () => (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                    <a href="#" className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                        <Activity className="h-6 w-6 text-blue-500" />
                        Oficentro<span className="text-blue-500">Masaya</span>
                    </a>
                    <p className="max-w-xs text-slate-400">
                        Comprometidos con tu bienestar a través de servicios médicos de excelencia y atención humanizada.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Enlaces</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#home" className="hover:text-blue-400 transition-colors">Inicio</a></li>
                        <li><a href="#specialties" className="hover:text-blue-400 transition-colors">Especialidades</a></li>
                        <li><a href="#about" className="hover:text-blue-400 transition-colors">Nosotros</a></li>
                        <li><a href="/auth/login" className="hover:text-blue-400 transition-colors">Portal Paciente</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Privacidad</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Términos</a></li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} Oficentro Masaya. Todos los derechos reservados.
            </div>
        </div>
    </footer>
);

// Main Layout
const LandingPage: React.FC = () => {
    return (
        <div className="font-sans antialiased bg-white selection:bg-blue-100 selection:text-blue-900">
            <Header />
            <main>
                <Hero />
                <Specialties />
                <Statistics />
                <Promotions />
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;