export interface StyleAnalysis {
  creativeMedium: string;
  lightingShadows: string;
  colorPalette: string;
  compositionCamera: string;
  textureFinish: string;
  detailedAesthetic: string;
  styleTemplate: string;
}

export interface AnalysisResponse {
  success: boolean;
  imagePreview: string;
  analysis: StyleAnalysis;
}

export interface ExportResponse {
  success: boolean;
  fileName: string;
  filePath: string;
  exportDir?: string;
  entryNumber?: number;
  appended?: boolean;
  openedInExplorer?: boolean;
}

export interface SampleAesthetic {
  title: string;
  description: string;
  imageUrl: string;
  result: StyleAnalysis;
}

export interface ApiKeyConfigResponse {
  configured: boolean;
  masked?: string;
}
