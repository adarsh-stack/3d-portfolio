"use client";

import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCube, Keyboard } from "swiper/modules";
import "swiper/css";
import { sendContactEmail } from "../app/actions/contact.js";
import "swiper/css/effect-cube";

import {
  Home,
  User,
  Briefcase,
  Grid as GridIcon,
  Mail,
  Download,
  ExternalLink,
} from "lucide-react";

const formatUrl = (url) => {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
};

// --- Custom SVG Brand Icons ---
const LinkedinIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const LeetcodeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.039-1.901l-2.606-2.636c-1.114-1.114-2.802-1.545-4.402-1.282-1.464.24-2.81 1.054-3.725 2.158L3.13 11.232c-1.382 1.397-1.382 3.66 0 5.057l4.318 4.38c1.397 1.382 3.66 1.382 5.057 0l2.697-2.606c.514-.515.496-1.366-.039-1.9-.535-.535-1.386-.517-1.9.038v-.038zM20.811 11.25H11.233c-.768 0-1.39.622-1.39 1.39s.622 1.39 1.39 1.39h9.578c.768 0 1.39-.622 1.39-1.39s-.622-1.39-1.39-1.39z" />
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
    <path d="M9 18c-4.5 1-5-2.5-7-2"></path>
  </svg>
);

export default function PortfolioClient({ initialData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [resumeTab, setResumeTab] = useState("experience");
  const [portfolioTab, setPortfolioTab] = useState("work");

  const [selectedCard, setSelectedCard] = useState(null);

  const safeData = {
    personal: initialData?.personalInfo || {},
    educations: initialData?.educations || [],
    experiences: initialData?.experiences || [],
    projects: initialData?.projects || [],
    liveWorks: initialData?.liveWorks || [],
    skills: initialData?.skills || [],
    offerings: initialData?.offerings || [],
    certifications: initialData?.certifications?.length
      ? initialData.certifications
      : [
          {
            _id: "cert-1",
            duration: "Achieved",
            name: "Introduction to Embedded Machine Learning",
            issuer: "Edge Impulse - Coursera",
            details: "",
          },
          {
            _id: "cert-2",
            duration: "Achieved",
            name: "Introduction and Programming with IoT Boards",
            issuer: "Postech (Pohang University of Science and Technology)",
            details: "",
          },
          {
            _id: "cert-3",
            duration: "Achieved",
            name: "JAVA - Advanced",
            issuer: "Udemy",
            details: "",
          },
          {
            _id: "cert-4",
            duration: "Achieved",
            name: "Introduction to Statistics",
            issuer: "Stanford University via Coursera",
            details: "",
          },
          {
            _id: "cert-5",
            duration: "Achieved",
            name: "Microsoft Excel - Advanced",
            issuer: "Udemy",
            details: "",
          },
        ],
  };

  const navItems = [
    { icon: <Home size={20} />, label: "Home" },
    { icon: <User size={20} />, label: "About" },
    { icon: <Briefcase size={20} />, label: "Resume" },
    { icon: <GridIcon size={20} />, label: "Portfolio" },
    { icon: <Mail size={20} />, label: "Contact" },
  ];

  const handleNavClick = (index) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(index);
    }
  };

  const handleContactChange = (e) =>
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await sendContactEmail(contactForm);
    setIsSubmitting(false);
    if (res.success) {
      setShowSuccess(true);
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <Swiper
        ref={swiperRef}
        effect={"cube"}
        grabCursor={true}
        cubeEffect={{
          shadow: true,
          slideShadows: true,
          shadowOffset: 40,
          shadowScale: 0.94,
        }}
        keyboard={{ enabled: true }}
        modules={[EffectCube, Keyboard]}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="w-full max-w-6xl h-[85vh] md:h-[75vh]"
      >
        {/* --- 1. HOME SLIDE --- */}
        <SwiperSlide className="bg-[#1a202c] rounded-2xl shadow-2xl p-8 md:p-12 flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center w-full h-full">
            <div className="space-y-3 order-2 md:order-1">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-300">
                Hello I'm
              </h2>
              <div className="flex flex-col gap-1 mb-2">
                <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 leading-tight">
                  {safeData?.personal?.name || "Developer"}
                </h1>
                <h3 className="text-lg md:text-xl font-medium text-slate-200">
                  {safeData?.personal?.designation || "Software Developer"}
                </h3>
              </div>
              <div className="max-w-lg mt-2">
                <p className="text-slate-400 text-sm md:text-base line-clamp-2">
                  {safeData?.personal?.description ||
                    "Passionate about crafting responsive, user-focused web interfaces."}
                </p>
                <button
                  onClick={() => handleNavClick(1)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition mt-1"
                >
                  Read More...
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                {safeData?.personal?.cv && (
                  <a
                    href={safeData.personal.cv}
                    download="Resume.pdf"
                    className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold px-6 py-3 rounded-full transition"
                  >
                    <Download size={18} /> Download CV
                  </a>
                )}
                {safeData?.personal?.linkedin && (
                  <a
                    href={formatUrl(safeData.personal.linkedin)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 rounded-full transition"
                  >
                    <LinkedinIcon className="w-5 h-5" />
                  </a>
                )}
                {safeData?.personal?.github && (
                  <a
                    href={formatUrl(safeData.personal.github)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 rounded-full transition"
                  >
                    <GithubIcon className="w-5 h-5" />
                  </a>
                )}
                {safeData?.personal?.leetcode && (
                  <a
                    href={formatUrl(safeData.personal.leetcode)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 rounded-full transition"
                  >
                    <LeetcodeIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] p-2">
                {safeData.personal.profilePic ? (
                  <img
                    src={safeData.personal.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* --- 2. ABOUT SLIDE --- */}
        <SwiperSlide className="bg-[#1a202c] rounded-2xl shadow-2xl p-8 md:p-12 flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center w-full h-full">
            <div className="flex justify-center mb-8 md:mb-0">
              <div className="relative w-56 h-56 md:w-80 md:h-80 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] p-2">
                {safeData.personal.profilePic && (
                  <img
                    src={safeData.personal.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </div>
            </div>
            <div className="space-y-6 flex flex-col h-full justify-center">
              <h1 className="text-4xl md:text-5xl font-bold">
                About <span className="text-cyan-400">Me</span>
              </h1>
              <h3 className="text-xl font-medium text-slate-200">
                {safeData?.personal?.designation || "Frontend Developer"}
              </h3>
              <div className="overflow-y-auto swiper-no-swiping custom-scrollbar pr-2 max-h-[40vh]">
                <p className="text-slate-400 leading-relaxed">
                  {safeData.personal.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* --- 3. RESUME SLIDE --- */}
        <SwiperSlide className="bg-[#1a202c] rounded-2xl shadow-2xl p-6 md:p-10">
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Static Header Section */}
            <div className="flex-none mb-6">
              <h2 className="text-3xl font-bold text-center mb-6">Resume</h2>
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 border-b border-slate-700 w-full max-w-3xl mx-auto">
                {["experience", "skills", "education", "certifications"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setResumeTab(tab)}
                      className={`pb-3 text-sm md:text-base font-semibold capitalize transition-all ${
                        resumeTab === tab
                          ? "text-cyan-400 border-b-2 border-cyan-400"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab === "experience" ? "Internship & Projects" : tab}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Scrollable Content Section */}
            <div className="flex-1 overflow-y-auto swiper-no-swiping custom-scrollbar pr-4 pb-24 relative">
              {resumeTab === "experience" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeData.experiences.map((exp) => (
                    <div
                      key={exp._id}
                      className="bg-[#222938] p-4 rounded-xl border border-slate-700 hover:border-cyan-400 transition flex flex-col min-h-[110px]"
                    >
                      <span className="text-cyan-400 text-xs font-mono block mb-1">
                        {exp.duration}
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1 leading-tight">
                        {exp.name}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-1 mb-2 flex-1">
                        {exp.experience}
                      </p>
                      <button
                        onClick={() =>
                          setSelectedCard({ type: "experience", data: exp })
                        }
                        className="text-cyan-400 text-xs font-semibold hover:underline mt-auto self-start"
                      >
                        Read More
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {resumeTab === "skills" && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {safeData.skills.map((skill) => (
                    <div
                      key={skill._id}
                      className="bg-[#222938] flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 hover:border-cyan-400 transition group"
                    >
                      {skill.logo && (
                        <img
                          src={skill.logo}
                          alt={skill.name}
                          className="w-8 h-8 mb-2 object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition"
                        />
                      )}
                      <span className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400 text-center">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {resumeTab === "education" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeData.educations.map((edu) => (
                    <div
                      key={edu._id}
                      className="bg-[#222938] p-4 rounded-xl border border-slate-700 hover:border-cyan-400 transition flex flex-col min-h-[110px]"
                    >
                      <span className="text-cyan-400 text-xs font-mono block mb-1">
                        {edu.timelines}
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1 leading-tight">
                        {edu.degree}
                      </h3>
                      <p className="text-slate-400 text-xs mb-2 line-clamp-1 flex-1">
                        📍 {edu.institute}
                      </p>
                      <button
                        onClick={() =>
                          setSelectedCard({ type: "education", data: edu })
                        }
                        className="text-cyan-400 text-xs font-semibold hover:underline mt-auto self-start"
                      >
                        Read More
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {resumeTab === "certifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeData.certifications.map((cert) => (
                    <div
                      key={cert._id}
                      className="bg-[#222938] p-4 rounded-xl border border-slate-700 hover:border-cyan-400 transition flex flex-col min-h-[110px]"
                    >
                      <span className="text-cyan-400 text-xs font-mono block mb-1">
                        {cert.duration || "Achieved"}
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1 leading-tight">
                        {cert.name}
                      </h3>
                      <p className="text-slate-400 text-xs mb-2 line-clamp-1 flex-1">
                        🏆 {cert.issuer}
                      </p>
                      <button
                        onClick={() =>
                          setSelectedCard({ type: "certification", data: cert })
                        }
                        className="text-cyan-400 text-xs font-semibold hover:underline mt-auto self-start"
                      >
                        Read More
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SwiperSlide>

        {/* --- 4. PORTFOLIO SLIDE --- */}
        <SwiperSlide className="bg-[#1a202c] rounded-2xl shadow-2xl p-6 md:p-10">
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Static Header Section */}
            <div className="flex-none mb-6">
              <h2 className="text-3xl font-bold text-center mb-6">Portfolio</h2>
              <div className="flex justify-center gap-8 md:gap-16 border-b border-slate-700 w-full max-w-xl mx-auto">
                {["work", "services"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPortfolioTab(tab)}
                    className={`pb-3 text-sm md:text-base font-semibold capitalize transition-all ${
                      portfolioTab === tab
                        ? "text-cyan-400 border-b-2 border-cyan-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    My {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content Section */}
            <div className="flex-1 overflow-y-auto swiper-no-swiping custom-scrollbar pr-4 pb-24 relative">
              {portfolioTab === "work" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...safeData.projects, ...safeData.liveWorks].map((work) => (
                    <div
                      key={work._id}
                      className="group relative rounded-xl overflow-hidden bg-[#222938] aspect-video border border-slate-700"
                    >
                      {work.images?.[0] || work.logo ? (
                        <img
                          src={work.images?.[0] || work.logo}
                          alt={work.name}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-20 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                          No Preview
                        </div>
                      )}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 className="text-base font-bold text-cyan-400 mb-1">
                          {work.name}
                        </h3>
                        <p className="text-xs text-slate-200 line-clamp-2 mb-3">
                          {work.description}
                        </p>
                        <div className="flex gap-2">
                          {(work.link || work.githubLink) && (
                            <a
                              href={work.link || work.githubLink}
                              target="_blank"
                              rel="noreferrer"
                              className="w-7 h-7 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-cyan-400 transition"
                            >
                              {work.link ? (
                                <ExternalLink size={14} />
                              ) : (
                                <GithubIcon className="w-3 h-3" />
                              )}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {portfolioTab === "services" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeData.offerings.map((service) => (
                    <div
                      key={service._id}
                      className="bg-[#222938] p-4 rounded-xl border border-slate-700 hover:border-cyan-400 transition flex flex-col min-h-[110px]"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {service.logo ? (
                          <img
                            src={service.logo}
                            alt=""
                            className="w-8 h-8 object-contain filter group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400">
                            <GridIcon size={16} />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base md:text-lg font-bold text-white mb-1 leading-tight">
                            {service.name}
                          </h3>
                          <p className="text-slate-400 text-xs line-clamp-1 mb-2">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedCard({ type: "service", data: service })
                        }
                        className="text-cyan-400 text-xs font-semibold hover:underline mt-2 self-start"
                      >
                        Read More
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SwiperSlide>

        {/* --- 5. CONTACT SLIDE --- */}
        <SwiperSlide className="bg-[#1a202c] rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 relative">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl font-bold text-center mb-2">Contact</h1>
            <h2 className="text-xl text-cyan-400 font-semibold mb-8 text-center">
              Let's Work Together
            </h2>
            <form className="w-full space-y-5" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <input
                  required
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-[#222938] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400 transition text-sm"
                />
                <input
                  required
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-[#222938] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400 transition text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <input
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  type="text"
                  placeholder="Phone Number"
                  className="w-full bg-[#222938] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400 transition text-sm"
                />
                <input
                  required
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  type="text"
                  placeholder="Email Subject"
                  className="w-full bg-[#222938] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400 transition text-sm"
                />
              </div>
              <textarea
                required
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                placeholder="Your Message"
                rows="3"
                className="w-full bg-[#222938] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400 transition resize-none text-sm"
              ></textarea>
              <div className="flex justify-center pt-2">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold px-8 py-2 rounded-full transition shadow-[0_0_15px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>

          {showSuccess && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-cyan-400 p-8 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.3)] flex flex-col items-center z-50">
              <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex items-center justify-center mb-4 text-cyan-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Message Sent!
              </h3>
              <p className="text-slate-400 text-center">
                I will get back to you shortly.
              </p>
            </div>
          )}
        </SwiperSlide>
      </Swiper>

      {/* --- POPUP WINDOW MODAL --- */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-[#1a202c] border border-slate-700 rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-5 text-slate-400 hover:text-cyan-400 transition bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setSelectedCard(null)}
            >
              ✕
            </button>

            <div className="overflow-y-auto swiper-no-swiping custom-scrollbar pr-4 mt-2">
              {selectedCard.type === "experience" && (
                <>
                  <span className="text-cyan-400 font-mono block mb-2">
                    {selectedCard.data.duration}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    {selectedCard.data.name}
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {selectedCard.data.experience}
                  </p>
                </>
              )}
              {selectedCard.type === "education" && (
                <>
                  <span className="text-cyan-400 font-mono block mb-2">
                    {selectedCard.data.timelines}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {selectedCard.data.degree}
                  </h3>
                  <p className="text-slate-400 mb-6 text-base md:text-lg">
                    📍 {selectedCard.data.institute}
                  </p>
                  {selectedCard.data.marks && (
                    <div className="bg-[#222938] p-4 rounded-xl inline-block border border-slate-700">
                      <p className="text-slate-300">
                        Score / Grade:{" "}
                        <span className="font-bold text-cyan-400">
                          {selectedCard.data.marks}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
              {selectedCard.type === "certification" && (
                <>
                  <span className="text-cyan-400 font-mono block mb-2">
                    {selectedCard.data.duration || "Achieved"}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {selectedCard.data.name}
                  </h3>
                  <p className="text-slate-400 mb-6 text-base md:text-lg">
                    🏆 {selectedCard.data.issuer}
                  </p>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {selectedCard.data.details ||
                      selectedCard.data.description ||
                      "No specific details provided for this certification."}
                  </p>
                </>
              )}
              {selectedCard.type === "service" && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    {selectedCard.data.logo && (
                      <img
                        src={selectedCard.data.logo}
                        alt=""
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {selectedCard.data.name}
                    </h3>
                  </div>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {selectedCard.data.description}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM FLOATING NAVIGATION --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#1a202c]/90 backdrop-blur-md border border-slate-700 rounded-full flex items-center px-6 py-3 gap-6 shadow-2xl">
          {navItems.map((item, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => handleNavClick(index)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "bg-cyan-400 text-slate-900"
                    : "text-slate-400 hover:text-cyan-400"
                }`}
              >
                {item.icon}
              </button>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyan-400 text-slate-900 text-xs font-bold py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a202c; border-radius: 10px; margin-bottom: 80px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #22d3ee; border-radius: 10px; }
      `,
        }}
      />
    </div>
  );
}
