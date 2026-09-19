"use client";

import { useState, useCallback } from "react";
import {
  updatePersonalInfoAction,
  saveItemAction,
  deleteItemAction,
} from "../actions/portfolio";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";

export default function DashboardClient({ initialData }) {
  const router = useRouter();

  // Safe fallbacks for data collections to prevent .map errors
  const safeData = {
    personalInfo: initialData?.personalInfo || {},
    educations: initialData?.educations || [],
    experiences: initialData?.experiences || [],
    projects: initialData?.projects || [],
    liveWorks: initialData?.liveWorks || [],
    skills: initialData?.skills || [],
    offerings: initialData?.offerings || [],
    certifications: initialData?.certifications || [],
  };

  // UI States
  const [previewCv, setPreviewCv] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Personal Info Form State
  const [personal, setPersonal] = useState(safeData.personalInfo);

  // Cropper States
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalCroppedFile, setFinalCroppedFile] = useState(null);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    if (safeData.personalInfo?._id) {
      form.append("_id", safeData.personalInfo._id);
    }

    // Inject the newly cropped file if it exists
    if (finalCroppedFile) {
      form.set("profilePicFile", finalCroppedFile);
    }

    form.append("existingProfilePic", personal.profilePic || "");
    form.append("existingCv", personal.cv || "");

    await updatePersonalInfoAction(form);

    // Reset states and refresh
    setActiveModal(null);
    setFinalCroppedFile(null);
    router.refresh();
  };

  const handleGenericSubmit = async (collection, e, imageFields = []) => {
    e.preventDefault();
    const form = new FormData(e.target);
    if (currentItem?._id) form.append("_id", currentItem._id);

    await saveItemAction(collection, form, imageFields);
    setActiveModal(null);
    setCurrentItem(null);
    router.refresh();
  };

  const handleDelete = async (collection, id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItemAction(collection, id);
      router.refresh();
    }
  };

  // Utility to convert crop area to a new File
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
    });

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "cropped_profile.jpg", {
          type: "image/jpeg",
        });
        resolve(file);
      }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // When user selects an image from their PC
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // When user clicks "Confirm Crop"
  const generateCroppedImage = async () => {
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFinalCroppedFile(croppedFile);
      setImageSrc(null); // Close Modal
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Portfolio Control Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your live portfolio records stored securely in MongoDB
              Atlas.
            </p>
          </div>
          <a
            href="/admin"
            className="text-sm bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            🔒 Authenticated Session Active
          </a>
        </header>

        {/* 1. PERSONAL INFO SECTION */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              👤 Personal Information & Bio
            </h2>
            <button
              onClick={() => {
                setCurrentItem(personal);
                setActiveModal("personal");
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="flex flex-col items-center justify-center gap-3">
              {personal.profilePic ? (
                <img
                  src={personal.profilePic}
                  alt="Profile"
                  onClick={() => setPreviewImage(personal.profilePic)}
                  title="Click to preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-md cursor-pointer hover:opacity-80 transition hover:scale-105"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700 text-xs">
                  No Image
                </div>
              )}
              {personal.cv && (
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPreviewCv(true)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 shadow-md"
                  >
                    👁️ Preview CV
                  </button>
                  <a
                    href={personal.cv}
                    download="Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1"
                  >
                    📄 Download
                  </a>
                </div>
              )}
            </div>
            <div className="md:col-span-3 space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Name</span>{" "}
                  <span className="font-medium">
                    {personal.name || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Designation</span>{" "}
                  <span className="font-medium">
                    {personal?.designation || "Frontend Developer"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>{" "}
                  <span className="font-medium">
                    {personal.email || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>{" "}
                  <span className="font-medium">
                    {personal.phone || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">GitHub</span>{" "}
                  <span className="font-medium truncate block">
                    {personal.github || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">LinkedIn</span>{" "}
                  <span className="font-medium truncate block">
                    {personal.linkedin || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">LeetCode</span>{" "}
                  <span className="font-medium truncate block">
                    {personal.leetcode || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Address</span>{" "}
                  <span className="font-medium truncate block">
                    {personal.address || "Not set"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 block text-xs">
                  Bio Description
                </span>
                <p className="text-sm text-slate-300 mt-1 italic">
                  {personal.description || "No description provided yet."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GRID SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 2. EDUCATION SECTION */}
          <SectionContainer
            title="🎓 Education"
            onAdd={() => {
              setCurrentItem({
                degree: "",
                timelines: "",
                institute: "",
                marks: "",
              });
              setActiveModal("education");
            }}
          >
            {safeData.educations.map((edu) => (
              <CardItem
                key={edu._id}
                onEdit={() => {
                  setCurrentItem(edu);
                  setActiveModal("education");
                }}
                onDelete={() => handleDelete("educations", edu._id)}
              >
                <h4 className="font-bold text-sm">{edu.degree}</h4>
                <p className="text-xs text-indigo-400 font-mono">
                  {edu.institute} • {edu.timelines}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Marks / CGPA:{" "}
                  <span className="text-slate-200 font-semibold">
                    {edu.marks}
                  </span>
                </p>
              </CardItem>
            ))}
          </SectionContainer>

          {/* 3. EXPERIENCE SECTION */}
          <SectionContainer
            title="💼 Experience"
            onAdd={() => {
              setCurrentItem({
                name: "",
                duration: "",
                experience: "",
                picture: "",
              });
              setActiveModal("experience");
            }}
          >
            {safeData.experiences.map((exp) => (
              <CardItem
                key={exp._id}
                onEdit={() => {
                  setCurrentItem(exp);
                  setActiveModal("experience");
                }}
                onDelete={() => handleDelete("experiences", exp._id)}
              >
                <div className="flex items-center gap-3">
                  {exp.picture && (
                    <img
                      src={exp.picture}
                      alt=""
                      onClick={() => setPreviewImage(exp.picture)}
                      title="Click to preview"
                      className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition border border-slate-700"
                    />
                  )}
                  <div>
                    <h4 className="font-bold">{exp.name}</h4>
                    <p className="text-xs text-indigo-400 font-mono">
                      {exp.duration}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {exp.experience}
                    </p>
                  </div>
                </div>
              </CardItem>
            ))}
          </SectionContainer>

          {/* 4. PROJECTS SECTION */}
          <SectionContainer
            title="🚀 Projects"
            onAdd={() => {
              setCurrentItem({
                name: "",
                githubLink: "",
                description: "",
                images: ["", "", "", "", ""],
              });
              setActiveModal("project");
            }}
          >
            {safeData.projects.map((proj) => (
              <CardItem
                key={proj._id}
                onEdit={() => {
                  setCurrentItem(proj);
                  setActiveModal("project");
                }}
                onDelete={() => handleDelete("projects", proj._id)}
              >
                <h4 className="font-bold">{proj.name}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {proj.description}
                </p>
                <div className="flex gap-1 mt-2">
                  {proj.images?.filter(Boolean).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      onClick={() => setPreviewImage(img)}
                      title="Click to preview"
                      className="w-6 h-6 rounded object-cover border border-slate-700 cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
                </div>
              </CardItem>
            ))}
          </SectionContainer>

         {/* showing window */}
          {/* 6. SKILLS SECTION */}
          <SectionContainer
            title="⚡ Skills"
            onAdd={() => {
              setCurrentItem({ name: "", scale: "3", logo: "" });
              setActiveModal("skill");
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              {safeData.skills.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {skill.logo && (
                      <img
                        src={skill.logo}
                        alt=""
                        onClick={() => setPreviewImage(skill.logo)}
                        title="Click to preview"
                        className="w-8 h-8 rounded object-contain bg-slate-900 p-1 cursor-pointer hover:opacity-80 transition border border-slate-800"
                      />
                    )}
                    <div>
                      <h5 className="font-semibold text-sm">{skill.name}</h5>
                      <span className="text-xs text-blue-400 font-mono">
                        Level: {skill.scale}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setCurrentItem(skill);
                        setActiveModal("skill");
                      }}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("skills", skill._id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionContainer>

          {/* 7. OFFERINGS SECTION */}
          <SectionContainer
            title="💎 Offerings / Services"
            onAdd={() => {
              setCurrentItem({ name: "", description: "", logo: "" });
              setActiveModal("offering");
            }}
          >
            {safeData.offerings.map((off) => (
              <CardItem
                key={off._id}
                onEdit={() => {
                  setCurrentItem(off);
                  setActiveModal("offering");
                }}
                onDelete={() => handleDelete("offerings", off._id)}
              >
                <div className="flex items-center gap-3">
                  {off.logo && (
                    <img
                      src={off.logo}
                      alt=""
                      onClick={() => setPreviewImage(off.logo)}
                      title="Click to preview"
                      className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 cursor-pointer hover:opacity-80 transition border border-slate-700"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">{off.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {off.description}
                    </p>
                  </div>
                </div>
              </CardItem>
            ))}
          </SectionContainer>

          {/* 8. CERTIFICATIONS SECTION */}
          <SectionContainer
            title="📜 Certifications"
            onAdd={() => {
              setCurrentItem({
                name: "",
                issuer: "",
                date: "",
                credentialLink: "",
                image: "",
              });
              setActiveModal("certification");
            }}
          >
            {safeData.certifications.map((cert) => (
              <CardItem
                key={cert._id}
                onEdit={() => {
                  setCurrentItem(cert);
                  setActiveModal("certification");
                }}
                onDelete={() => handleDelete("certifications", cert._id)}
              >
                <div className="flex items-center gap-3">
                  {cert.image && (
                    <img
                      src={cert.image}
                      alt=""
                      onClick={() => setPreviewImage(cert.image)}
                      title="Click to preview"
                      className="w-10 h-10 rounded-md object-cover cursor-pointer hover:opacity-80 transition border border-slate-700"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">{cert.name}</h4>
                    <p className="text-xs text-slate-400">
                      {cert.issuer} •{" "}
                      <span className="font-mono">{cert.date}</span>
                    </p>
                  </div>
                </div>
              </CardItem>
            ))}
          </SectionContainer>
        </div>
      </div>

      {/* --- IMAGE PREVIEW POPUP MODAL --- */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 w-8 h-8 rounded-full flex items-center justify-center transition font-bold"
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[75vh] max-w-full object-contain rounded-xl mt-6 border border-slate-800"
            />
            <p className="text-xs text-slate-400 mt-3 font-mono">
              Full-size image preview
            </p>
          </div>
        </div>
      )}

      {/* --- MODALS FOR EDITING/ADDING --- */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
            {/* 1. Personal Modal */}
            {activeModal === "personal" && (
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                <h3 className="text-xl font-bold mb-4">
                  Edit Personal Information & Bio
                </h3>
                <InputField
                  label="Full Name"
                  name="name"
                  defaultValue={personal.name}
                />
                <InputField
                  label="Designation"
                  name="designation"
                  defaultValue={personal.designation}
                />
                <InputField
                  label="Email"
                  name="email"
                  defaultValue={personal.email}
                  type="email"
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  defaultValue={personal.phone}
                />
                <InputField
                  label="Address"
                  name="address"
                  defaultValue={personal.address}
                />
                <InputField
                  label="LinkedIn URL"
                  name="linkedin"
                  defaultValue={personal.linkedin}
                />
                <InputField
                  label="GitHub URL"
                  name="github"
                  defaultValue={personal.github}
                />
                <InputField
                  label="LeetCode URL"
                  name="leetcode"
                  defaultValue={personal.leetcode}
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Bio Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={personal.description}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Fixed Profile Image Upload Field matching CV styling */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                  />
                  {finalCroppedFile && (
                    <span className="text-xs text-green-400 mt-2 block">
                      ✓ Image cropped and ready to save
                    </span>
                  )}
                </div>

                {/* CV Upload Field */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    CV Upload (PDF format)
                  </label>
                  <input
                    type="file"
                    name="cvFile"
                    accept="application/pdf"
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                  />
                </div>

                <ModalButtons onClose={() => setActiveModal(null)} />
              </form>
            )}

            {/* Crop Modal Popup (Nested above forms) */}
            {imageSrc && (
              <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4">
                <div className="relative w-full max-w-md h-96 bg-slate-900 rounded-lg overflow-hidden border border-cyan-400">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setImageSrc(null)}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateCroppedImage}
                    className="px-6 py-2 bg-cyan-400 text-slate-900 font-bold rounded-lg hover:bg-cyan-300"
                  >
                    Confirm Crop
                  </button>
                </div>
              </div>
            )}

            {/* 2. Education Modal */}
            {activeModal === "education" && (
              <form
                onSubmit={(e) => handleGenericSubmit("educations", e)}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">
                  {currentItem?._id ? "Edit Education" : "Add Education"}
                </h3>
                <InputField
                  label="Degree / Qualification"
                  name="degree"
                  defaultValue={currentItem.degree}
                  required
                />
                <InputField
                  label="Timelines (e.g. 2022 - 2026)"
                  name="timelines"
                  defaultValue={currentItem.timelines}
                  required
                />
                <InputField
                  label="Institute Name"
                  name="institute"
                  defaultValue={currentItem.institute}
                  required
                />
                <InputField
                  label="Marks / CGPA (e.g. 8.9 CGPA / 92%)"
                  name="marks"
                  defaultValue={currentItem.marks}
                  required
                />
                <ModalButtons onClose={() => setActiveModal(null)} />
              </form>
            )}

            {/* 3. Experience Modal */}
            {activeModal === "experience" && (
              <form
                onSubmit={(e) =>
                  handleGenericSubmit("experiences", e, ["picture"])
                }
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">
                  {currentItem?._id ? "Edit Experience" : "Add Experience"}
                </h3>
                <InputField
                  label="Title / Role Name"
                  name="name"
                  defaultValue={currentItem.name}
                  required
                />
                <InputField
                  label="Duration (e.g. 2024 - Present)"
                  name="duration"
                  defaultValue={currentItem.duration}
                  required
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Experience Description
                  </label>
                  <textarea
                    name="experience"
                    defaultValue={currentItem.experience}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Company / Badge Image Upload
                  </label>
                  <input
                    type="file"
                    name="picture"
                    accept="image/*"
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
                  />
                  <input
                    type="hidden"
                    name="existing_picture"
                    value={currentItem.picture || ""}
                  />
                </div>
                <ModalButtons onClose={() => setActiveModal(null)} />
              </form>
            )}

            {/* 4. Project Modal */}
            {activeModal === "project" && (
              <form
                onSubmit={(e) => handleGenericSubmit("projects", e)}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">
                  {currentItem?._id ? "Edit Project" : "Add Project"}
                </h3>
                <InputField
                  label="Project Name"
                  name="name"
                  defaultValue={currentItem.name}
                  required
                />
                <InputField
                  label="GitHub Repository Link"
                  name="githubLink"
                  defaultValue={currentItem.githubLink}
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={currentItem.description}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-semibold text-blue-400">
                    Upload up to 5 Project Images
                  </label>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="mb-2 flex items-center gap-2">
                      <input
                        type="file"
                        name={`image_${i}`}
                        accept="image/*"
                        className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-lg file:bg-slate-800 file:text-slate-300 file:border-0 cursor-pointer"
                      />
                      <input
                        type="hidden"
                        name={`existing_image_${i}`}
                        value={currentItem.images?.[i] || ""}
                      />
                      {currentItem.images?.[i] && (
                        <span className="text-xs text-green-400 font-mono">
                          Saved
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <ModalButtons onClose={() => setActiveModal(null)} />
              </form>
            )}

            {/* 5. Live Works Modal */}
            {activeModal === "liveWork" && (
              <form
                onSubmit={(e) => handleGenericSubmit("live_works", e)}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">
                  {currentItem?._id ? "Edit Live Work" : "Add Live Work"}
                </h3>
                <InputField
                  label="Work Name"
                  name="name"
                  defaultValue={currentItem.name}
                  required
                />
                <InputField
                  label="Live Demo URL"
                  name="link"
                  defaultValue={currentItem.link}
                />
                <InputField
                  label="GitHub Link"
                  name="gitLink"
                  defaultValue={currentItem.gitLink}
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={currentItem.description}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <ModalButtons onClose={() => setActiveModal(null)} />
              </form>
            )}

            {/* 6. Skill Modal */}
            {activeModal === "skill" && (
              <form
                onSubmit={(e) => handleGenericSubmit("skills", e, ["logo"])}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">
                  {currentItem?._id ? "Edit Skill" : "Add Skill"}
                </h3>
                <InputField
                  label="Skill Name"
                  name="name"
                  defaultValue={currentItem.name}
                  required
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Proficiency Scale (1 to 5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    name="scale"
                    defaultValue={currentItem.scale || "3"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Logo Image Upload
                  </label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
                  />
                  <input
                    type="hidden"
                    name="existing_logo"
                    value={currentItem.logo || ""}
                  />
                </div>
                <ModalButtons onClose={() => setActiveModal(null)} />
              </form>
            )}
            {/* offering Done as commented */}
            {/* 8. Certification Modal */}
            {activeModal === "certification" && (
              <form
                onSubmit={(e) =>
                  handleGenericSubmit("certifications", e, ["image"])
                }
                className="space-y-4"
              >
                <h3 className="text-xl font-bold mb-4">
                  {currentItem?._id
                    ? "Edit Certification"
                    : "Add Certification"}
                </h3>
                <InputField
                  label="Certificate Name"
                  name="name"
                  defaultValue={currentItem.name}
                  required
                />
                <InputField
                  label="Issuing Organization"
                  name="issuer"
                  defaultValue={currentItem.issuer}
                  required
                />
                <InputField
                  label="Date Issued (e.g. June 2026)"
                  name="date"
                  defaultValue={currentItem.date}
                />
                <InputField
                  label="Credential Link"
                  name="credentialLink"
                  defaultValue={currentItem.credentialLink}
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Certificate Image / Badge Upload
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
                  />
                  <input
                    type="hidden"
                    name="existing_image"
                    value={currentItem.image || ""}
                  />
                </div>
                <ModalButtons onClose={() => setActiveModal(null)} />
              </form>
            )}

            {/* --- CV PDF PREVIEW MODAL --- */}
            {previewCv && (
              <div
                className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
                onClick={() => setPreviewCv(false)}
              >
                <div
                  className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3 px-2">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      📄 Resume / CV Preview
                    </h3>
                    <button
                      onClick={() => setPreviewCv(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 w-8 h-8 rounded-full flex items-center justify-center transition font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* PDF Viewer */}
                  <div className="flex-1 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                    <iframe
                      src={personal.cv}
                      title="CV Preview"
                      className="w-full h-full border-0"
                    />
                  </div>

                  {/* Footer info */}
                  <div className="pt-3 text-center">
                    <p className="text-xs text-slate-400">
                      If the preview doesn't load directly due to browser
                      security policies, use the download button below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function SectionContainer({ title, onAdd, children }) {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            + Add New
          </button>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </section>
  );
}

function CardItem({ children, onEdit, onDelete }) {
  return (
    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-700 transition">
      <div className="flex-1 pr-4">{children}</div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onEdit}
          className="text-xs text-blue-400 hover:underline px-2 py-1 bg-blue-950/50 rounded-lg"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:underline px-2 py-1 bg-red-950/50 rounded-lg"
        >
          Del
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue || ""}
        required={required}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
      />
    </div>
  );
}

function ModalButtons({ onClose }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-600/20"
      >
        Save Changes
      </button>
    </div>
  );
}


//  {/* 5. LIVE WORKS SECTION */}
//           <SectionContainer
//             title="🌐 Live Works"
//             onAdd={() => {
//               setCurrentItem({
//                 name: "",
//                 description: "",
//                 link: "",
//                 gitLink: "",
//               });
//               setActiveModal("liveWork");
//             }}
//           >
//             {safeData.liveWorks.map((lw) => (
//               <CardItem
//                 key={lw._id}
//                 onEdit={() => {
//                   setCurrentItem(lw);
//                   setActiveModal("liveWork");
//                 }}
//                 onDelete={() => handleDelete("live_works", lw._id)}
//               >
//                 <h4 className="font-bold text-sm">{lw.name}</h4>
//                 <p className="text-xs text-slate-400 mt-1 line-clamp-1">
//                   {lw.description}
//                 </p>
//                 <div className="flex gap-3 mt-2 text-xs">
//                   {lw.link && (
//                     <a
//                       href={lw.link}
//                       target="_blank"
//                       className="text-blue-400 hover:underline"
//                     >
//                       Live Demo ↗
//                     </a>
//                   )}
//                   {lw.gitLink && (
//                     <a
//                       href={lw.gitLink}
//                       target="_blank"
//                       className="text-indigo-400 hover:underline"
//                     >
//                       GitHub ↗
//                     </a>
//                   )}
//                 </div>
//               </CardItem>
//             ))}
//           </SectionContainer>





// {/* 7. Offering Modal */}
// {activeModal === "offering" && (
//   <form
//     onSubmit={(e) => handleGenericSubmit("offerings", e, ["logo"])}
//     className="space-y-4"
//   >
//     <h3 className="text-xl font-bold mb-4">
//       {currentItem?._id ? "Edit Offering" : "Add Offering"}
//     </h3>
//     <InputField
//       label="Offering / Service Name"
//       name="name"
//       defaultValue={currentItem.name}
//       required
//     />
//     <div>
//       <label className="block text-xs text-slate-400 mb-1">
//         Description
//       </label>
//       <textarea
//         name="description"
//         defaultValue={currentItem.description}
//         rows={3}
//         className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
//         required
//       />
//     </div>
//     <div>
//       <label className="block text-xs text-slate-400 mb-1">
//         Logo Image Upload
//       </label>
//       <input
//         type="file"
//         name="logo"
//         accept="image/*"
//         className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
//       />
//       <input
//         type="hidden"
//         name="existing_logo"
//         value={currentItem.logo || ""}
//       />
//     </div>
//     <ModalButtons onClose={() => setActiveModal(null)} />
//   </form>
// )}
