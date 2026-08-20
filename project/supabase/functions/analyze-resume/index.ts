import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { resumeId, resumeText, jobDescription } = body;

    if (!resumeId || !resumeText) {
      return new Response(
        JSON.stringify({ error: "resumeId and resumeText are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Extract skills from resume text using keyword matching
    const knownSkills = [
      "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js", "Express",
      "Next.js", "Nuxt.js", "Python", "Django", "Flask", "FastAPI", "Java", "Spring",
      "Kotlin", "Swift", "Go", "Rust", "C++", "C#", ".NET", "Ruby", "Rails",
      "PHP", "Laravel", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
      "GraphQL", "REST", "gRPC", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
      "Terraform", "CI/CD", "Jenkins", "Git", "HTML", "CSS", "Sass", "Tailwind",
      "Figma", "Sketch", "Prototyping", "Design Systems", "User Research",
      "Machine Learning", "PyTorch", "TensorFlow", "ML", "Data Science",
      "Statistics", "Tableau", "Power BI", "React Native", "iOS", "Android",
      "Leadership", "Architecture", "System Design", "Security", "Networking",
      "Cryptography", "DevOps", "SRE", "Agile", "Scrum", "Kanban", "Jira",
      "Testing", "Jest", "Cypress", "Playwright", "Selenium", "Webpack", "Vite",
      "Babel", "ESLint", "Prettier", "Microservices", "API Design", "Linux",
      "Bash", "PowerShell", "Elasticsearch", "Kafka", "RabbitMQ", "Redis",
      "Supabase", "Firebase", "Prisma", "TypeORM", "Django REST", "Spring Boot",
      "Redux", "Zustand", "MobX", "Storybook", "Chromatic", "Accessibility",
      "SEO", "Performance", "WebRTC", "WebSocket", "PWA", "Service Workers",
    ];

    const resumeLower = resumeText.toLowerCase();
    const extractedSkills = knownSkills.filter((skill) =>
      resumeLower.includes(skill.toLowerCase()),
    );

    // Calculate ATS score
    let atsScore = 50;

    if (jobDescription) {
      const jobLower = jobDescription.toLowerCase();
      const jobWords = new Set(
        jobLower
          .split(/\W+/)
          .filter((w) => w.length > 3 && !["the", "and", "for", "with", "your", "will", "have", "this", "that", "from", "they", "must", "able", "what", "which", "their", "about", "into", "than", "them", "well", "also", "more", "such", "some", "only", "very", "just", "over", "both", "most", "make", "like", "been", "were", "what"].includes(w)),
      );

      const resumeWords = new Set(
        resumeLower
          .split(/\W+/)
          .filter((w) => w.length > 3),
      );

      let matched = 0;
      let totalJobWords = 0;
      jobWords.forEach((word) => {
        totalJobWords++;
        if (resumeWords.has(word)) matched++;
      });

      const keywordMatchRate = totalJobWords > 0 ? matched / totalJobWords : 0;
      atsScore = Math.round(30 + keywordMatchRate * 70);
      atsScore = Math.min(100, Math.max(0, atsScore));
    } else {
      // Without a job description, score based on resume quality
      const wordCount = resumeText.split(/\s+/).length;
      const hasContact = /\b[\w.-]+@[\w.-]+\.\w+\b/.test(resumeText);
      const hasEducation = /degree|bachelor|master|phd|university|college/i.test(resumeText);
      const hasExperience = /experience|worked|developed|built|managed|led|created/i.test(resumeText);

      atsScore = 40;
      if (wordCount > 200) atsScore += 15;
      if (wordCount > 400) atsScore += 10;
      if (hasContact) atsScore += 10;
      if (hasEducation) atsScore += 10;
      if (hasExperience) atsScore += 15;
      atsScore = Math.min(100, atsScore);
    }

    // Generate improvement suggestions
    const suggestions: string[] = [];
    if (extractedSkills.length < 5) {
      suggestions.push("Add more specific technical skills to help your resume get past ATS filters.");
    }
    if (!/^\d+/.test(resumeText) && !/\b\d{4}\b/.test(resumeText)) {
      suggestions.push("Include quantifiable achievements with numbers and dates (e.g., 'Increased performance by 40%').");
    }
    if (resumeText.split(/\s+/).length < 300) {
      suggestions.push("Your resume seems short. Aim for 300-500 words with detailed experience descriptions.");
    }
    if (!/degree|bachelor|master|phd|university|college|bootcamp|certification/i.test(resumeText)) {
      suggestions.push("Include your education or relevant certifications.");
    }
    if (jobDescription && atsScore < 70) {
      const jobSkills = knownSkills.filter((s) =>
        jobDescription.toLowerCase().includes(s.toLowerCase()),
      );
      const missingSkills = jobSkills.filter(
        (s) => !extractedSkills.includes(s),
      );
      if (missingSkills.length > 0) {
        suggestions.push(
          `Consider adding these keywords from the job description: ${missingSkills.slice(0, 5).join(", ")}.`,
        );
      }
    }
    if (suggestions.length === 0) {
      suggestions.push("Your resume looks well-structured. Tailor it to each job for best results.");
    }

    // Update resume in database
    await supabase
      .from("resumes")
      .update({
        parsed_skills: extractedSkills,
        parsed_text: resumeText,
        ats_score: atsScore,
      })
      .eq("id", resumeId);

    // Update profile skills if resume is primary
    const { data: resumeData } = await supabase
      .from("resumes")
      .select("is_primary")
      .eq("id", resumeId)
      .maybeSingle();

    if (resumeData?.is_primary) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("skills")
        .eq("id", user.id)
        .maybeSingle();

      const existingSkills = (profileData?.skills || []) as string[];
      const mergedSkills = Array.from(
        new Set([...existingSkills, ...extractedSkills]),
      );

      await supabase
        .from("profiles")
        .update({ skills: mergedSkills })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({
        ats_score: atsScore,
        parsed_skills: extractedSkills,
        suggestions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
