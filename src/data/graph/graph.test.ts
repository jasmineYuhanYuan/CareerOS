import { describe, expect, it } from "vitest";
import { careerKnowledgeGraph, knowledgeEntities } from ".";
import { resolveEntity } from "./resolution";
import { validateKnowledgeGraph } from "./validation";
import { navigationItems } from "@/components/layout/navigation";

describe("career knowledge graph", () => {
  it("resolves known aliases without creating duplicate entities", () => {
    expect(resolveEntity("AHPRA", knowledgeEntities)?.id).toBe("authority-ahpra");
    expect(resolveEntity("Australian Health Practitioner Regulation Agency", knowledgeEntities)?.id).toBe("authority-ahpra");
    expect(resolveEntity("ACT", knowledgeEntities)?.id).toBe("location-canberra-act");
    expect(resolveEntity("Canberra region", knowledgeEntities)?.id).toBe("location-canberra-act");
  });

  it("contains no invalid or orphaned relationships", () => {
    expect(validateKnowledgeGraph(careerKnowledgeGraph)).toEqual([]);
    expect(careerKnowledgeGraph.entities).toHaveLength(72);
    expect(careerKnowledgeGraph.relationships).toHaveLength(35);
  });

  it("keeps Tommy's chiropractic planning out of global navigation and Yuhan scope", () => {
    expect(navigationItems.some((item) => item.href === "/chiropractic")).toBe(false);
    const chiropracticEntities = knowledgeEntities.filter((entity) =>
      entity.profileIds.includes("taicheng-guo-tommy"),
    );
    expect(chiropracticEntities.length).toBeGreaterThan(0);
    expect(chiropracticEntities.every((entity) => !entity.profileIds.includes("yuhan-yuan"))).toBe(true);
  });

  it("connects Xero to its interview and assessment using official evidence", () => {
    expect(careerKnowledgeGraph.relationships).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceEntityId: "company-xero-au", targetEntityId: "interview-xero-graduate", relationshipType: "interview-process" }),
      expect.objectContaining({ sourceEntityId: "interview-xero-graduate", targetEntityId: "oa-xero-hackerrank", relationshipType: "uses-assessment" }),
    ]));
  });

  it("rejects invalid strength, orphan and archived connections", () => {
    const broken = structuredClone(careerKnowledgeGraph);
    broken.relationships.push({
      ...broken.relationships[0],
      id: "invalid-strength",
      strength: 101,
    });
    broken.relationships.push({
      ...broken.relationships[0],
      id: "orphan",
      targetEntityId: "missing",
    });
    broken.entities[0].verificationStatus = "Archived";
    expect(validateKnowledgeGraph(broken).join(" ")).toMatch(/strength must be 0–100/);
    expect(validateKnowledgeGraph(broken).join(" ")).toMatch(/orphaned relationship/);
    expect(validateKnowledgeGraph(broken).join(" ")).toMatch(/archived entity/);
  });

  it("requires evidence and prevents inappropriate progression cycles", () => {
    const graph = structuredClone(careerKnowledgeGraph);
    const [first, second] = graph.entities;
    graph.relationships.push({
      id: "progress-one",
      sourceEntityId: first.id,
      targetEntityId: second.id,
      relationshipType: "progresses-to",
      strength: 50,
      rationale: "",
      evidenceSourceIds: [],
      verificationStatus: "Verified",
      confidence: "Medium",
      lastVerified: "2026-07-29",
      notes: "",
    }, {
      id: "progress-two",
      sourceEntityId: second.id,
      targetEntityId: first.id,
      relationshipType: "progresses-to",
      strength: 50,
      rationale: "Reverse path",
      evidenceSourceIds: second.sourceIds,
      verificationStatus: "Verified",
      confidence: "Medium",
      lastVerified: "2026-07-29",
      notes: "",
    });
    const errors = validateKnowledgeGraph(graph).join(" ");
    expect(errors).toMatch(/missing evidence/);
    expect(errors).toMatch(/circular progression/);
  });
});
