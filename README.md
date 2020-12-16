# WebProgramming Final Project
게임명 : SNULIFE

# 8조 멤버
신상원, 공나영, 백승원, 박준혁

# Codesandbox Link
코드 : https://codesandbox.io/s/sharp-snow-opqym
게임 : https://opqym.sse.codesandbox.io/

# 기본 구성
수업시간에 배운 express, mongoose르 활용하여 개발 하였으며 실시간으로 데이터가 저장되도록 하였음. 또한 게임 내부 정보인 아이템, 맵 등의 정보는 json형태로 서버에서 따로 보관하였다.

# 구현한 머드게임의 주제
 서울대학교의 신입생으로 들어와 1학년~4학년이라는 과정을 통해 성장하며 마지막 최종 보스인 JIN을 물리치는 것. 다양한 아이템과 몬스터, 필드를 진입할때나 몬스터와 싸울 때 나오는 description으로 재미를 더하였다. 

# 기본스펙 구현
1. 온라인에서 플레이가 가능하다( codesandbox 등을 활용)
 => 코드샌드박스를 이용하였음. 링크 올림.
2. 로그인, 회원가입
 => 처음 구현된 player 이름을 넣으면 아이디가 만들어지는 방식을 사용.
3. 10 * 10 이상의 맵
 => 정확히 10*10 맵을 만듬. 맵 구성은 5*5의 사각형을 4개 쪼개 1학년 ~ 4학년구역을 만들었음.
4. 캐릭터의 이동
 => 동서남북 모두 이동 가능하다 원활한 진행을 위해 한번 이동하면 돌아가지 못하는 루트나 벽을 만들었음.
5. 이동 시 필드별로 아무일도 일어나지 않음, 전투, 아이템 획득의 일이 일어남.
 => 필드에 나타나는 이벤트 종류로는 nothing, battle, item, ending 총 4가지로 구현하였지만. item 이라는 이벤트에서 가지를 친 이벤트 들이 많음(공격수치증가,방어수치증가,HP증가,감소, MAXHP증가 등)
6. 5종 이상의 몬스터
 => 총 24종의 몬스터로 앞에서 말한 한 구역당 6마리의 몬스터를 배치하였음(각 필드당 하나의 보스 몬스터 존재)
7. 5종 이상의 아이템
 => 총 64종의 아이템을 배치하였음 (1학년 - 26종, 2학년 -13종, 3학년 - 12종, 4학년 - 13종)
 => 이는 운이라는 요소가 게임플레이에 있어서 중요한 요소로 생각했기 때문.
8. 전투 시스템( str, def, hp 개념을 활용)
 => 구현완료
9. 사망 시스템(전투 시 hp가 0이될 경우 캐릭터, 가 사망. 0,0 위치로 이동)
 => 구현완료
10. 레벨 시스템( 일정 이상 경험치 획득 시 캐릭터 레벨업.)
 => 구현완료



 # 추가스펙 구현
 1. 항목에 있는 것들은 대부분 다 구현하였음.
 2. css를 이용하여 스타일 개선
 3. 전투시 전투과정이 뜨도록 하였으며 전투시 각 몬스터가 내뱉는 멘트를 너어 재미를 더하였음.
 4. 아이템종류, 몬스터종류를 늘림으로서 운이라는 요소가 크게 게임에 관여하도록 함.



