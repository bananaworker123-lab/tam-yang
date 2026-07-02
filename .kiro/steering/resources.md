---
inclusion: always
---

# External Resources

## Design Resources
- **Design tool**: Interactive prototype (HTML) — `Initial-requirement/app_design/Homeroom - Homework Tracker.dc.html`
- **Design system docs**: ฝังใน prototype (CSS variables: accent `#5B53E0`, fonts Plus Jakarta Sans + Bricolage Grotesque, status colors)
- **Wireframes/mockups**: `Initial-requirement/app_design/screenshots/*.png`, `Initial-requirement/app_design/uploads/*.png`

## API Resources
- **OpenAPI/Swagger spec**: none (จะออกแบบในเฟส design)
- **GraphQL schema**: none
- **Existing API docs**: none

## Knowledge Resources
- **Documentation**: `Initial-requirement/homework-tracker-design-brief.md` (Functional & Non-Functional Spec — source of truth)
- **Internal wiki**: none
- **Reference implementations**:
  - Mobbin — Task/Goal tracker screens: https://mobbin.com/explore/mobile/screens/goal-task
  - Uizard StudyPal: https://uizard.io/templates/mobile-app-templates/study-mobile-app/
  - Figma Task Organizing App Template: https://www.figma.com/community/file/1464972063262375204/task-organizing-app-ui-design-template
  - EduAdmin Dashboard (admin LMS): https://multipurposethemes.com/blog/eduadmin-learning-app-template-with-dashboard-ui-design/

## Available Tools
- [x] Design prototype (HTML) — ใช้อ้างอิง UI/UX และ design system
- [x] Web search
- [ ] Other MCP servers: ___

## Notes
- Source of truth ด้านพฤติกรรม/กฎ = design brief; source of truth ด้าน UI/visual = HTML prototype
- ต้องตั้งค่า Google OAuth credentials ตอน implement (เก็บเป็น secret ไม่ commit)
- โปรเจกต์ต้องมี backend + database (multi-family isolation, RBAC, audit log) — ต่างจาก client-only app
