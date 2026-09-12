export type DiseaseClass =
  | 'bacterial_leaf_blight'
  | 'brown_spot'
  | 'leaf_blast'
  | 'tungro'
  | 'healthy'
  | 'not_rice_leaf'

export interface InferenceResult {
  topClass: DiseaseClass
  confidence: number
  allProbs: Record<DiseaseClass, number>
  isUnclear: boolean
}

export interface Session {
  id: string
  photos: string[]          // object URLs, up to 3
  disease: DiseaseClass | null
  timestamp: number
  saved: boolean
}

export interface SavedReport {
  id: string
  disease: DiseaseClass
  timestamp: number
  photoUrl: string
}
