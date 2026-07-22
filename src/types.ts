export interface ColumnMapping {
  용량: number;
  상품명: number;
  수량: number;
  수령인: number;
  우편번호: number;
  주소: number;
  연락처: number;
  배송메시지: number;
}

export interface PlatformConfig {
  id: string;
  name: string;
  identifier: string;
  start_row: number;
  col_map: ColumnMapping;
  tracking_col: number;
  courier_col?: number;
  filepath_pattern: string;
}

export interface ProductMapping {
  rawName: string;
  mappedName: string;
}

export interface ProcessedOrder {
  id: string; // 순번 등
  용량: string;
  상품명: string;
  수량: number;
  주문자: string;
  수령인: string;
  연락처: string;
  우편번호: string;
  주소: string;
  배송메시지: string;
  sortKey: string;
  combinedId: string;
  isMulti: boolean;
  trackingNumber?: string;
  courierName?: string;
  multiplier?: number;
  originalOptionName: string;
  originalProductName: string;
}

export interface MatchingError {
  type: 'unfilled' | 'unused';
  name: string;
  prod: string;
  qty: string;
  zipCode: string;
  reason: string;
}
