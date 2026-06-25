/**
 * SBOM (Software Bill of Materials) Generator
 * CycloneDX format for supply chain risk management
 * Vendor-neutral compliance and transparency
 *
 * © 2026 OpenAutonomyX Contributors
 * Built with Claude AI (Anthropic AI Coding Agent)
 * Licensed under MIT License
 *
 * This file is part of OpenAutonomyX, an open-source
 * vendor-neutral creative publishing platform.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ComponentInfo {
  name: string;
  version: string;
  license: string;
  scope: 'required' | 'optional';
  repository?: string;
  checksum?: string;
  vulnerabilities?: string[];
}

export interface SBOM {
  bomVersion: number;
  specVersion: string;
  version: string;
  metadata: {
    timestamp: string;
    tools: Array<{ name: string; version: string }>;
    component?: ComponentInfo;
  };
  components: ComponentInfo[];
  vulnerabilities?: Array<{
    ref: string;
    ratings: Array<{ score: number; severity: string }>;
  }>;
}

/**
 * Generate Software Bill of Materials
 */
export class SBOMGenerator {
  /**
   * Generate SBOM from package.json
   */
  static async generateFromPackageJson(
    packageJsonPath: string
  ): Promise<SBOM> {
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf-8')
    );

    const components: ComponentInfo[] = [];

    // Process dependencies
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      components.push({
        name,
        version: version as string,
        license: 'UNKNOWN', // Would need license detection
        scope: 'required',
      });
    }

    // Process dev dependencies
    for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
      components.push({
        name,
        version: version as string,
        license: 'UNKNOWN',
        scope: 'optional',
      });
    }

    return {
      bomVersion: 1,
      specVersion: '1.4',
      version: packageJson.version || '1.0.0',
      metadata: {
        timestamp: new Date().toISOString(),
        tools: [
          {
            name: 'OpenAutonomyX SBOM Generator',
            version: '1.0.0',
          },
        ],
        component: {
          name: packageJson.name,
          version: packageJson.version,
          license: packageJson.license || 'UNLICENSED',
          scope: 'required',
          repository: packageJson.repository?.url,
        },
      },
      components,
    };
  }

  /**
   * Save SBOM to file (CycloneDX XML format)
   */
  static saveSBOM(sbom: SBOM, outputPath: string): void {
    const xml = this.generateCycloneDXXML(sbom);
    fs.writeFileSync(outputPath, xml, 'utf-8');
    console.log(`✅ SBOM saved to ${outputPath}`);
  }

  /**
   * Generate CycloneDX XML format
   */
  private static generateCycloneDXXML(sbom: SBOM): string {
    const timestamp = sbom.metadata.timestamp;
    const components = sbom.components
      .map(
        (c) => `
    <component type="library" bom-ref="${c.name}@${c.version}">
      <name>${this.escapeXml(c.name)}</name>
      <version>${this.escapeXml(c.version)}</version>
      <licenses>
        <license>
          <name>${this.escapeXml(c.license)}</name>
        </license>
      </licenses>
      <scope>${c.scope}</scope>
      ${c.repository ? `<repository>${this.escapeXml(c.repository)}</repository>` : ''}
    </component>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<bom xmlns="http://cyclonedx.org/schema/bom/1.4" version="${sbom.bomVersion}">
  <metadata>
    <timestamp>${timestamp}</timestamp>
    <tools>
${sbom.metadata.tools.map((t) => `      <tool name="${t.name}" version="${t.version}"/>`).join('\n')}
    </tools>
    ${
      sbom.metadata.component
        ? `<component type="application">
      <name>${this.escapeXml(sbom.metadata.component.name)}</name>
      <version>${sbom.metadata.component.version}</version>
      <licenses>
        <license>
          <name>${this.escapeXml(sbom.metadata.component.license)}</name>
        </license>
      </licenses>
    </component>`
        : ''
    }
  </metadata>
  <components>
${components}
  </components>
</bom>`;
  }

  /**
   * Escape XML special characters
   */
  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Check for known vulnerabilities
   */
  static async checkVulnerabilities(sbom: SBOM): Promise<string[]> {
    // This would integrate with vulnerability databases:
    // - NVD (National Vulnerability Database)
    // - OSV (Open Source Vulnerabilities)
    // - Snyk
    // - GitHub Security Advisory

    const vulnerabilities: string[] = [];

    // Example check (would be actual DB lookup)
    for (const component of sbom.components) {
      // Mock vulnerability check
      if (component.name.includes('vulnerable-lib')) {
        vulnerabilities.push(
          `${component.name}@${component.version}: Known vulnerability CVE-2024-XXXX`
        );
      }
    }

    return vulnerabilities;
  }

  /**
   * Generate compliance report
   */
  static generateComplianceReport(sbom: SBOM): {
    totalComponents: number;
    licenseCompliance: Map<string, number>;
    riskScore: number;
  } {
    const licenseCompliance = new Map<string, number>();

    for (const component of sbom.components) {
      const count = licenseCompliance.get(component.license) || 0;
      licenseCompliance.set(component.license, count + 1);
    }

    // Calculate risk score (0-100)
    const unknownLicenses = licenseCompliance.get('UNKNOWN') || 0;
    const riskScore = Math.min(100, (unknownLicenses / sbom.components.length) * 100);

    return {
      totalComponents: sbom.components.length,
      licenseCompliance,
      riskScore,
    };
  }
}

/**
 * Vendor Neutrality Checker
 */
export class VendorNeutralityChecker {
  /**
   * Check if architecture is vendor-neutral
   */
  static async checkVendorLockIn(sbom: SBOM): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let vendorLockInScore = 0; // 0 = fully vendor-neutral, 100 = highly locked in

    // Check for vendor-specific dependencies
    const vendorPatterns: Record<string, RegExp> = {
      AWS: /aws-sdk|@aws/,
      Azure: /azure-/,
      GCP: /@google-cloud/,
      Salesforce: /salesforce/,
      Oracle: /oracle/,
    };

    for (const component of sbom.components) {
      for (const [vendor, pattern] of Object.entries(vendorPatterns)) {
        if (pattern.test(component.name)) {
          issues.push(
            `Vendor lock-in detected: ${component.name} (${vendor})`
          );
          vendorLockInScore += 20;

          recommendations.push(
            `Consider vendor-neutral alternative to ${component.name}`
          );
        }
      }
    }

    // Check for proprietary licenses
    const proprietaryLicenses = [
      'COMMERCIAL',
      'PROPRIETARY',
      'CUSTOM',
    ];

    for (const [license, count] of sbom.components.reduce((acc, c) => {
      const existing = acc.get(c.license) || 0;
      acc.set(c.license, existing + 1);
      return acc;
    }, new Map<string, number>())) {
      if (proprietaryLicenses.some((p) => license.includes(p))) {
        issues.push(
          `${count} component(s) use proprietary license: ${license}`
        );
        vendorLockInScore += 10;
      }
    }

    return {
      score: Math.min(100, vendorLockInScore),
      issues,
      recommendations,
    };
  }
}

/**
 * Supply Chain Risk Assessment
 */
export class SupplyChainRiskAssessment {
  /**
   * Assess overall supply chain risk
   */
  static assess(sbom: SBOM): {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number;
    factors: string[];
  } {
    let score = 0;
    const factors: string[] = [];

    // Unknown licenses increase risk
    const unknownCount = sbom.components.filter(
      (c) => c.license === 'UNKNOWN'
    ).length;
    if (unknownCount > 0) {
      score += unknownCount * 5;
      factors.push(`${unknownCount} components with unknown licenses`);
    }

    // Outdated components (mock check)
    const outdatedCount = sbom.components.filter(
      (c) => !this.isModernVersion(c.version)
    ).length;
    if (outdatedCount > 0) {
      score += outdatedCount * 3;
      factors.push(`${outdatedCount} potentially outdated components`);
    }

    // High number of dependencies
    if (sbom.components.length > 100) {
      score += 15;
      factors.push('High number of dependencies (>100)');
    }

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (score < 20) {
      riskLevel = 'LOW';
    } else if (score < 50) {
      riskLevel = 'MEDIUM';
    } else if (score < 80) {
      riskLevel = 'HIGH';
    } else {
      riskLevel = 'CRITICAL';
    }

    return { riskLevel, score, factors };
  }

  private static isModernVersion(version: string): boolean {
    // Simple check - real implementation would compare against npm registry
    const major = parseInt(version.split('.')[0].replace(/[^\d]/g, ''));
    return !isNaN(major) && major >= 1;
  }
}
