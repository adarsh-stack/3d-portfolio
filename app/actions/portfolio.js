// actions/portfolio.js
'use server'

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db('portfolioDB');
}

// Helper to convert uploaded File to Base64 string for DB storage
async function fileToBase64(file) {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function getPortfolioData() {
  const db = await getDb();
  
  // Fetch all collections safely
  const [personalInfo, educations, experiences, projects, liveWorks, skills, offerings, certifications] = await Promise.all([
    db.collection('personal_info').findOne({}),
    db.collection('educations').find().sort({ _id: -1 }).toArray(),
    db.collection('experiences').find().sort({ _id: -1 }).toArray(),
    db.collection('projects').find().sort({ _id: -1 }).toArray(),
    db.collection('live_works').find().sort({ _id: -1 }).toArray(),
    db.collection('skills').find().sort({ scale: -1 }).toArray(),
    db.collection('offerings').find().sort({ _id: -1 }).toArray(),
    db.collection('certifications').find().sort({ _id: -1 }).toArray()
  ]);

  return {
    personalInfo: personalInfo ? { ...personalInfo, _id: personalInfo._id.toString() } : null,
    educations: educations.map(e => ({ ...e, _id: e._id.toString() })),
    experiences: experiences.map(e => ({ ...e, _id: e._id.toString() })),
    projects: projects.map(p => ({ ...p, _id: p._id.toString() })),
    liveWorks: liveWorks.map(l => ({ ...l, _id: l._id.toString() })),
    skills: skills.map(s => ({ ...s, _id: s._id.toString() })),
    offerings: offerings.map(o => ({ ...o, _id: o._id.toString() })),
    certifications: certifications.map(c => ({ ...c, _id: c._id.toString() }))
  };
}

// --- Personal Info ---
export async function updatePersonalInfoAction(formData) {
  const db = await getDb();
  
  // 1. Handle Profile Picture File
  const profilePicFile = formData.get('profilePicFile');
  let profilePic = formData.get('existingProfilePic');
  if (profilePicFile && profilePicFile instanceof File && profilePicFile.size > 0) {
    profilePic = await fileToBase64(profilePicFile);
  }

  // 2. Handle CV PDF File
  const cvFile = formData.get('cvFile');
  let cv = formData.get('existingCv');
  if (cvFile && cvFile instanceof File && cvFile.size > 0) {
    cv = await fileToBase64(cvFile);
  }

  // 3. Construct data payload including description and cv
  const data = {
    name: formData.get('name'),
    designation: formData.get('designation'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    linkedin: formData.get('linkedin'),
    github: formData.get('github'),
    leetcode: formData.get('leetcode'),
    description: formData.get('description'), // <--- Fixed: now captured & saved
    profilePic,
    cv                                         // <--- Fixed: now captured & saved
  };

  const id = formData.get('_id');
  if (id && id !== 'undefined' && id !== 'null') {
    await db.collection('personal_info').updateOne({ _id: new ObjectId(id) }, { $set: data });
  } else {
    await db.collection('personal_info').insertOne(data);
  }
  return { success: true };
}

// --- Generic Document Saver (Experience, Project, Skill, Certification, Education, Offering, LiveWork) ---
export async function saveItemAction(collectionName, formData, imageFields = []) {
  const db = await getDb();
  const id = formData.get('_id');
  const data = {};

  for (let [key, value] of formData.entries()) {
    if (key === '_id') continue;
    if (imageFields.includes(key)) {
      if (value instanceof File && value.size > 0) {
        data[key] = await fileToBase64(value);
      } else if (typeof value === 'string') {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }

  // Handle multi-image arrays (like the 5 project images)
  if (collectionName === 'projects') {
    const images = [];
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`);
      const existing = formData.get(`existing_image_${i}`);
      if (file instanceof File && file.size > 0) {
        images.push(await fileToBase64(file));
      } else {
        images.push(existing || '');
      }
    }
    data.images = images;
  }

  if (id && id !== 'undefined' && id !== 'null') {
    await db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: data });
  } else {
    await db.collection(collectionName).insertOne(data);
  }
  return { success: true };
}

export async function deleteItemAction(collectionName, id) {
  const db = await getDb();
  await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  return { success: true };
}