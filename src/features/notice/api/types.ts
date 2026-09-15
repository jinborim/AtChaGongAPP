/**
 * 공지 목록의 content 배열에 들어가는 단일 공지 항목
 */
export type NoticeListItem = {
  noticeId: number;
  title: string;
  isNew: boolean;
  createdAt: string; // ISO 8601 날짜 문자열
};

/**
 * 공지 목록 조회 API의 data 객체 타입
 */
export type NoticeList = {
  content: NoticeListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/**
 * 공지 상세 조회 API의 data 객체 타입
 */
export type NoticeDetail = {
  noticeId: number;
  title: string;
  content: string;
  imgUrl: string | null; // 이미지가 없을 경우 null
  isNew: boolean;
  createdAt: string;
};
