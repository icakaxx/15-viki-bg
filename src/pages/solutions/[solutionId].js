import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { solutions } from "../../lib/solutionsData";
import Link from "next/link";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticPaths() {
  return {
    paths: solutions.map((s) => ({ params: { solutionId: s.id } })),
    fallback: false,
  };
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const SolutionDetail = () => {
  const router = useRouter();
  const { solutionId } = router.query;
  const { t, i18n } = useTranslation("common");

  const solution = solutions.find((s) => s.id === solutionId);

  // Debug logs for translation values
  const title = t(`${solution?.translationKey}.title`);
  const short = t(`${solution?.translationKey}.short`);
  const details = t(`${solution?.translationKey}.details`);
  const benefits = t(`${solution?.translationKey}.benefits`, { returnObjects: true });
  console.log('DEBUG SOLUTION TRANSLATIONS:', {
    solutionId,
    translationKey: solution?.translationKey,
    title,
    short,
    details,
    benefits,
    benefitsType: typeof benefits,
    benefitsIsArray: Array.isArray(benefits),
  });

  if (!solution) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1>404</h1>
        <p>{t("solutions.not_found", "Solution not found.")}</p>
        <Link href="/products" style={{ color: "#0070f3", textDecoration: "underline" }}>{t("solutions.back_to_products", "Back to Products & Solutions")}</Link>
      </div>
    );
  }

  // Placeholder gallery images (use the main image 3-5 times for now)
  const galleryImages = Array(4).fill(solution.image);
  const benefitsArray = Array.isArray(benefits) ? benefits : [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: 12 }}>{title}</h1>
        <p style={{ fontSize: "1.2rem", color: "#555", marginBottom: 24 }}>{short}</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          {galleryImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={title}
              style={{ width: 180, height: 120, objectFit: "cover", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
            />
          ))}
        </div>
      </section>

      {/* Details Section */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>{t("solutions.details_title", i18n.language === "bg" ? "Детайли" : "Details")}</h2>
        <p style={{ color: "#444", fontSize: "1.1rem", marginBottom: 20 }}>{details}</p>
        <ul style={{ marginLeft: 24, marginBottom: 24 }}>
          {benefitsArray.map((benefit, idx) => (
            <li key={idx} style={{ marginBottom: 8, color: "#2c5530", fontWeight: 500 }}>
              • {benefit}
            </li>
          ))}
        </ul>
      </section>

      {/* Call to Action */}
      <section style={{ textAlign: "center", marginTop: 40 }}>
        <Link href="/contact">
          <button
            style={{
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "1rem 2.5rem",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {t("solutions.cta_contact", i18n.language === "bg" ? "Свържете се с нас" : "Contact Us")}
          </button>
        </Link>
      </section>
    </div>
  );
};

export default SolutionDetail; 