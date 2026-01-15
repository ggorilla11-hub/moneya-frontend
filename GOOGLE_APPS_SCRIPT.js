// ============================================
// AI머니야 강의/상담 신청 - Google Apps Script
// ============================================
// 
// 📋 설치 방법:
// 1. 새 구글시트 생성
// 2. 확장 프로그램 > Apps Script 클릭
// 3. 아래 코드 전체를 복사하여 붙여넣기
// 4. 저장 (Ctrl+S)
// 5. 배포 > 새 배포 > 웹 앱 선택
// 6. 실행 대상: 나
// 7. 액세스 권한: 모든 사용자
// 8. 배포 클릭
// 9. 생성된 URL을 복사
// 10. ConsultingRequestPage.tsx의 GOOGLE_SHEET_WEBAPP_URL에 붙여넣기
//
// ============================================

// 시트 초기 설정 (한 번만 실행)
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // 헤더 설정
  const headers = [
    '신청일시',
    '상품ID',
    '상품명',
    '금액',
    '이름',
    '연락처',
    '이메일',
    '결제상태'
  ];
  
  // 첫 번째 행에 헤더 추가
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 스타일 적용
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white')
    .setHorizontalAlignment('center');
  
  // 열 너비 조정
  sheet.setColumnWidth(1, 150);  // 신청일시
  sheet.setColumnWidth(2, 120);  // 상품ID
  sheet.setColumnWidth(3, 150);  // 상품명
  sheet.setColumnWidth(4, 100);  // 금액
  sheet.setColumnWidth(5, 100);  // 이름
  sheet.setColumnWidth(6, 140);  // 연락처
  sheet.setColumnWidth(7, 200);  // 이메일
  sheet.setColumnWidth(8, 100);  // 결제상태
  
  // 시트 이름 변경
  sheet.setName('강의상담신청');
  
  Logger.log('시트 설정 완료!');
}

// POST 요청 처리 (웹앱에서 호출됨)
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    // 한국 시간으로 변환
    const timestamp = new Date(data.timestamp);
    const kstTimestamp = Utilities.formatDate(
      timestamp, 
      'Asia/Seoul', 
      'yyyy-MM-dd HH:mm:ss'
    );
    
    // 금액 포맷팅
    const formattedPrice = Number(data.price).toLocaleString() + '원';
    
    // 새 행 추가
    const newRow = [
      kstTimestamp,
      data.productId,
      data.productName,
      formattedPrice,
      data.name,
      data.phone,
      data.email,
      data.status || '결제대기'
    ];
    
    sheet.appendRow(newRow);
    
    // 새 행 스타일 적용 (결제대기 상태면 노란색 배경)
    const lastRow = sheet.getLastRow();
    if (data.status === '결제대기') {
      sheet.getRange(lastRow, 8).setBackground('#fff9c4');
    }
    
    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'OK', 
      message: 'AI머니야 강의/상담 신청 API가 정상 작동 중입니다.',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 테스트 함수
function testAddRow() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        productId: 'consult-online',
        productName: '비대면 상담',
        price: 330000,
        name: '테스트',
        phone: '010-1234-5678',
        email: 'test@example.com',
        status: '결제대기'
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
