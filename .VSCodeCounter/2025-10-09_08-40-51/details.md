# Details

Date : 2025-10-09 08:40:51

Directory /home/moura/projetos/projetos_web/nexus-agents/web

Total : 166 files,  33640 codes, 1288 comments, 3937 blanks, all 38865 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [web/.dockerignore](/web/.dockerignore) | Ignore | 47 | 24 | 24 | 95 |
| [web/Dockerfile](/web/Dockerfile) | Docker | 46 | 13 | 18 | 77 |
| [web/README.md](/web/README.md) | Markdown | 23 | 0 | 14 | 37 |
| [web/components.json](/web/components.json) | JSON | 21 | 0 | 0 | 21 |
| [web/deploy-direct.sh](/web/deploy-direct.sh) | Shell Script | 16 | 8 | 7 | 31 |
| [web/docker-compose.traefik.yml](/web/docker-compose.traefik.yml) | YAML | 72 | 9 | 11 | 92 |
| [web/docker-compose.yml](/web/docker-compose.yml) | YAML | 60 | 0 | 5 | 65 |
| [web/docker-stack.yml](/web/docker-stack.yml) | YAML | 42 | 11 | 2 | 55 |
| [web/eslint.config.mjs](/web/eslint.config.mjs) | JavaScript | 12 | 0 | 5 | 17 |
| [web/instrumentation.ts](/web/instrumentation.ts) | TypeScript | 41 | 5 | 5 | 51 |
| [web/migrations/001\_create\_cms\_tables.sql](/web/migrations/001_create_cms_tables.sql) | MS SQL | 99 | 12 | 17 | 128 |
| [web/migrations/003\_create\_messaging\_system.sql](/web/migrations/003_create_messaging_system.sql) | MS SQL | 151 | 31 | 42 | 224 |
| [web/migrations/004\_fix\_messaging\_rls\_policies.sql](/web/migrations/004_fix_messaging_rls_policies.sql) | MS SQL | 124 | 14 | 22 | 160 |
| [web/next.config.ts](/web/next.config.ts) | TypeScript | 39 | 6 | 8 | 53 |
| [web/nginx/nginx.conf](/web/nginx/nginx.conf) | Properties | 141 | 23 | 30 | 194 |
| [web/package-lock.json](/web/package-lock.json) | JSON | 8,547 | 0 | 1 | 8,548 |
| [web/package.json](/web/package.json) | JSON | 60 | 0 | 1 | 61 |
| [web/pnpm-lock.yaml](/web/pnpm-lock.yaml) | YAML | 4,671 | 0 | 1,128 | 5,799 |
| [web/portainer-stack.yml](/web/portainer-stack.yml) | YAML | 81 | 11 | 13 | 105 |
| [web/postcss.config.mjs](/web/postcss.config.mjs) | JavaScript | 4 | 0 | 2 | 6 |
| [web/public/file.svg](/web/public/file.svg) | XML | 1 | 0 | 0 | 1 |
| [web/public/globe.svg](/web/public/globe.svg) | XML | 1 | 0 | 0 | 1 |
| [web/public/next.svg](/web/public/next.svg) | XML | 1 | 0 | 0 | 1 |
| [web/public/vercel.svg](/web/public/vercel.svg) | XML | 1 | 0 | 0 | 1 |
| [web/public/window.svg](/web/public/window.svg) | XML | 1 | 0 | 0 | 1 |
| [web/src/app/api/diag/route.ts](/web/src/app/api/diag/route.ts) | TypeScript | 32 | 2 | 6 | 40 |
| [web/src/app/api/health/route.ts](/web/src/app/api/health/route.ts) | TypeScript | 37 | 1 | 3 | 41 |
| [web/src/app/api/knowledge-base/route.ts](/web/src/app/api/knowledge-base/route.ts) | TypeScript | 151 | 18 | 29 | 198 |
| [web/src/app/api/rag/route.ts](/web/src/app/api/rag/route.ts) | TypeScript | 78 | 2 | 16 | 96 |
| [web/src/app/api/setup-bucket/route.ts](/web/src/app/api/setup-bucket/route.ts) | TypeScript | 44 | 4 | 10 | 58 |
| [web/src/app/api/whatsapp-proxy/route.ts](/web/src/app/api/whatsapp-proxy/route.ts) | TypeScript | 88 | 7 | 16 | 111 |
| [web/src/app/dashboard/agents/\[id\]/page.tsx](/web/src/app/dashboard/agents/%5Bid%5D/page.tsx) | TypeScript JSX | 72 | 5 | 16 | 93 |
| [web/src/app/dashboard/agents/client-page.tsx](/web/src/app/dashboard/agents/client-page.tsx) | TypeScript JSX | 158 | 1 | 17 | 176 |
| [web/src/app/dashboard/agents/page.tsx](/web/src/app/dashboard/agents/page.tsx) | TypeScript JSX | 9 | 4 | 4 | 17 |
| [web/src/app/dashboard/analytics/client-page.tsx](/web/src/app/dashboard/analytics/client-page.tsx) | TypeScript JSX | 157 | 7 | 21 | 185 |
| [web/src/app/dashboard/analytics/page.tsx](/web/src/app/dashboard/analytics/page.tsx) | TypeScript JSX | 38 | 5 | 7 | 50 |
| [web/src/app/dashboard/attendants/client-page.tsx](/web/src/app/dashboard/attendants/client-page.tsx) | TypeScript JSX | 133 | 11 | 19 | 163 |
| [web/src/app/dashboard/attendants/page.tsx](/web/src/app/dashboard/attendants/page.tsx) | TypeScript JSX | 24 | 6 | 5 | 35 |
| [web/src/app/dashboard/channels/client-page.tsx](/web/src/app/dashboard/channels/client-page.tsx) | TypeScript JSX | 153 | 2 | 19 | 174 |
| [web/src/app/dashboard/channels/page.tsx](/web/src/app/dashboard/channels/page.tsx) | TypeScript JSX | 9 | 4 | 5 | 18 |
| [web/src/app/dashboard/knowledge-base/page.tsx](/web/src/app/dashboard/knowledge-base/page.tsx) | TypeScript JSX | 530 | 31 | 70 | 631 |
| [web/src/app/dashboard/layout.tsx](/web/src/app/dashboard/layout.tsx) | TypeScript JSX | 176 | 10 | 14 | 200 |
| [web/src/app/dashboard/messages/client-page.tsx](/web/src/app/dashboard/messages/client-page.tsx) | TypeScript JSX | 281 | 32 | 26 | 339 |
| [web/src/app/dashboard/messages/page.tsx](/web/src/app/dashboard/messages/page.tsx) | TypeScript JSX | 14 | 0 | 3 | 17 |
| [web/src/app/dashboard/page.tsx](/web/src/app/dashboard/page.tsx) | TypeScript JSX | 4 | 2 | 2 | 8 |
| [web/src/app/dashboard/plano/page.tsx](/web/src/app/dashboard/plano/page.tsx) | TypeScript JSX | 573 | 29 | 39 | 641 |
| [web/src/app/globals.css](/web/src/app/globals.css) | PostCSS | 119 | 1 | 7 | 127 |
| [web/src/app/layout.tsx](/web/src/app/layout.tsx) | TypeScript JSX | 54 | 6 | 6 | 66 |
| [web/src/app/login/page.tsx](/web/src/app/login/page.tsx) | TypeScript JSX | 26 | 3 | 6 | 35 |
| [web/src/app/page.tsx](/web/src/app/page.tsx) | TypeScript JSX | 4 | 0 | 2 | 6 |
| [web/src/app/signup/page.tsx](/web/src/app/signup/page.tsx) | TypeScript JSX | 27 | 4 | 6 | 37 |
| [web/src/components/agents/AgentCard.tsx](/web/src/components/agents/AgentCard.tsx) | TypeScript JSX | 282 | 9 | 16 | 307 |
| [web/src/components/agents/CreateAgentDialog.temp.tsx](/web/src/components/agents/CreateAgentDialog.temp.tsx) | TypeScript JSX | 383 | 12 | 33 | 428 |
| [web/src/components/agents/CreateAgentDialog.tsx](/web/src/components/agents/CreateAgentDialog.tsx) | TypeScript JSX | 438 | 18 | 37 | 493 |
| [web/src/components/agents/wizard/AgentCreationWizard.temp.tsx](/web/src/components/agents/wizard/AgentCreationWizard.temp.tsx) | TypeScript JSX | 295 | 14 | 41 | 350 |
| [web/src/components/agents/wizard/AgentCreationWizard.tsx](/web/src/components/agents/wizard/AgentCreationWizard.tsx) | TypeScript JSX | 207 | 13 | 32 | 252 |
| [web/src/components/agents/wizard/AgentTemplateGallery.tsx](/web/src/components/agents/wizard/AgentTemplateGallery.tsx) | TypeScript JSX | 185 | 2 | 23 | 210 |
| [web/src/components/agents/wizard/steps/ArchetypeSelector.tsx](/web/src/components/agents/wizard/steps/ArchetypeSelector.tsx) | TypeScript JSX | 182 | 1 | 19 | 202 |
| [web/src/components/agents/wizard/steps/BusinessStep.tsx](/web/src/components/agents/wizard/steps/BusinessStep.tsx) | TypeScript JSX | 28 | 0 | 3 | 31 |
| [web/src/components/agents/wizard/steps/ConversationFlows.tsx](/web/src/components/agents/wizard/steps/ConversationFlows.tsx) | TypeScript JSX | 164 | 2 | 17 | 183 |
| [web/src/components/agents/wizard/steps/PersonalityTraits.tsx](/web/src/components/agents/wizard/steps/PersonalityTraits.tsx) | TypeScript JSX | 175 | 1 | 20 | 196 |
| [web/src/components/agents/wizard/steps/ReviewPrompt.tsx](/web/src/components/agents/wizard/steps/ReviewPrompt.tsx) | TypeScript JSX | 112 | 0 | 6 | 118 |
| [web/src/components/agents/wizard/steps/ReviewStep.tsx](/web/src/components/agents/wizard/steps/ReviewStep.tsx) | TypeScript JSX | 56 | 0 | 10 | 66 |
| [web/src/components/agents/wizard/steps/index.d.ts](/web/src/components/agents/wizard/steps/index.d.ts) | TypeScript | 36 | 1 | 9 | 46 |
| [web/src/components/analytics/AnalyticsCard.tsx](/web/src/components/analytics/AnalyticsCard.tsx) | TypeScript JSX | 350 | 3 | 27 | 380 |
| [web/src/components/analytics/AnalyticsDashboard.tsx](/web/src/components/analytics/AnalyticsDashboard.tsx) | TypeScript JSX | 56 | 1 | 5 | 62 |
| [web/src/components/analytics/ConversationHeatmap.tsx](/web/src/components/analytics/ConversationHeatmap.tsx) | TypeScript JSX | 383 | 35 | 65 | 483 |
| [web/src/components/analytics/PeriodFilter.tsx](/web/src/components/analytics/PeriodFilter.tsx) | TypeScript JSX | 181 | 1 | 16 | 198 |
| [web/src/components/analytics/ValueMetricsCard.tsx](/web/src/components/analytics/ValueMetricsCard.tsx) | TypeScript JSX | 368 | 19 | 39 | 426 |
| [web/src/components/attendants/AttendantCard.tsx](/web/src/components/attendants/AttendantCard.tsx) | TypeScript JSX | 164 | 1 | 11 | 176 |
| [web/src/components/attendants/CreateAttendantModal.tsx](/web/src/components/attendants/CreateAttendantModal.tsx) | TypeScript JSX | 352 | 8 | 26 | 386 |
| [web/src/components/auth/LoginForm.tsx](/web/src/components/auth/LoginForm.tsx) | TypeScript JSX | 162 | 2 | 17 | 181 |
| [web/src/components/auth/LogoutButton.tsx](/web/src/components/auth/LogoutButton.tsx) | TypeScript JSX | 60 | 1 | 8 | 69 |
| [web/src/components/auth/SignUpForm.tsx](/web/src/components/auth/SignUpForm.tsx) | TypeScript JSX | 236 | 6 | 18 | 260 |
| [web/src/components/channels/ChannelCard.tsx](/web/src/components/channels/ChannelCard.tsx) | TypeScript JSX | 421 | 20 | 36 | 477 |
| [web/src/components/channels/CreateChannelDialog.tsx](/web/src/components/channels/CreateChannelDialog.tsx) | TypeScript JSX | 519 | 14 | 26 | 559 |
| [web/src/components/channels/QRCodeModal.tsx](/web/src/components/channels/QRCodeModal.tsx) | TypeScript JSX | 408 | 40 | 49 | 497 |
| [web/src/components/cms/DynamicLandingPage.tsx](/web/src/components/cms/DynamicLandingPage.tsx) | TypeScript JSX | 41 | 4 | 5 | 50 |
| [web/src/components/cms/DynamicSection.tsx](/web/src/components/cms/DynamicSection.tsx) | TypeScript JSX | 79 | 4 | 11 | 94 |
| [web/src/components/cms/sections/DynamicFeaturesSection.tsx](/web/src/components/cms/sections/DynamicFeaturesSection.tsx) | TypeScript JSX | 66 | 1 | 11 | 78 |
| [web/src/components/cms/sections/DynamicHeroSection.tsx](/web/src/components/cms/sections/DynamicHeroSection.tsx) | TypeScript JSX | 61 | 3 | 11 | 75 |
| [web/src/components/cms/sections/DynamicHowItWorksSection.tsx](/web/src/components/cms/sections/DynamicHowItWorksSection.tsx) | TypeScript JSX | 102 | 4 | 13 | 119 |
| [web/src/components/cms/sections/DynamicPricingSection.tsx](/web/src/components/cms/sections/DynamicPricingSection.tsx) | TypeScript JSX | 113 | 7 | 12 | 132 |
| [web/src/components/cms/sections/DynamicTestimonialsSection.tsx](/web/src/components/cms/sections/DynamicTestimonialsSection.tsx) | TypeScript JSX | 89 | 5 | 11 | 105 |
| [web/src/components/dashboard/StatCard.tsx](/web/src/components/dashboard/StatCard.tsx) | TypeScript JSX | 69 | 0 | 5 | 74 |
| [web/src/components/dashboard/TotalizadorCard.tsx](/web/src/components/dashboard/TotalizadorCard.tsx) | TypeScript JSX | 98 | 1 | 6 | 105 |
| [web/src/components/dashboard/TotalizadoresGrid.tsx](/web/src/components/dashboard/TotalizadoresGrid.tsx) | TypeScript JSX | 55 | 0 | 7 | 62 |
| [web/src/components/knowledge-base/CreateKnowledgeBaseDialog.tsx](/web/src/components/knowledge-base/CreateKnowledgeBaseDialog.tsx) | TypeScript JSX | 325 | 20 | 40 | 385 |
| [web/src/components/knowledge/KnowledgeBaseList.tsx](/web/src/components/knowledge/KnowledgeBaseList.tsx) | TypeScript JSX | 111 | 3 | 13 | 127 |
| [web/src/components/knowledge/KnowledgeBaseUploader.tsx](/web/src/components/knowledge/KnowledgeBaseUploader.tsx) | TypeScript JSX | 109 | 4 | 21 | 134 |
| [web/src/components/landing/FeaturesSection.tsx](/web/src/components/landing/FeaturesSection.tsx) | TypeScript JSX | 144 | 2 | 8 | 154 |
| [web/src/components/landing/Footer.tsx](/web/src/components/landing/Footer.tsx) | TypeScript JSX | 170 | 1 | 10 | 181 |
| [web/src/components/landing/HeroSection.tsx](/web/src/components/landing/HeroSection.tsx) | TypeScript JSX | 59 | 0 | 9 | 68 |
| [web/src/components/landing/HowItWorksSection.tsx](/web/src/components/landing/HowItWorksSection.tsx) | TypeScript JSX | 228 | 6 | 18 | 252 |
| [web/src/components/landing/Navbar.tsx](/web/src/components/landing/Navbar.tsx) | TypeScript JSX | 107 | 4 | 10 | 121 |
| [web/src/components/landing/PricingSection.tsx](/web/src/components/landing/PricingSection.tsx) | TypeScript JSX | 143 | 1 | 10 | 154 |
| [web/src/components/landing/TestimonialsSection.tsx](/web/src/components/landing/TestimonialsSection.tsx) | TypeScript JSX | 83 | 0 | 9 | 92 |
| [web/src/components/layout/Header.tsx](/web/src/components/layout/Header.tsx) | TypeScript JSX | 120 | 12 | 19 | 151 |
| [web/src/components/layout/HeaderContext.tsx](/web/src/components/layout/HeaderContext.tsx) | TypeScript JSX | 38 | 0 | 12 | 50 |
| [web/src/components/layout/HeaderSetter.tsx](/web/src/components/layout/HeaderSetter.tsx) | TypeScript JSX | 13 | 1 | 5 | 19 |
| [web/src/components/messaging/MessageForm.tsx](/web/src/components/messaging/MessageForm.tsx) | TypeScript JSX | 434 | 16 | 31 | 481 |
| [web/src/components/messaging/MessageList.tsx](/web/src/components/messaging/MessageList.tsx) | TypeScript JSX | 276 | 12 | 24 | 312 |
| [web/src/components/messaging/NotificationBell.tsx](/web/src/components/messaging/NotificationBell.tsx) | TypeScript JSX | 240 | 10 | 23 | 273 |
| [web/src/components/providers/ThemeProvider.tsx](/web/src/components/providers/ThemeProvider.tsx) | TypeScript JSX | 7 | 0 | 3 | 10 |
| [web/src/components/ui/alert-dialog.tsx](/web/src/components/ui/alert-dialog.tsx) | TypeScript JSX | 143 | 0 | 15 | 158 |
| [web/src/components/ui/alert.tsx](/web/src/components/ui/alert.tsx) | TypeScript JSX | 57 | 0 | 7 | 64 |
| [web/src/components/ui/avatar.tsx](/web/src/components/ui/avatar.tsx) | TypeScript JSX | 44 | 0 | 7 | 51 |
| [web/src/components/ui/badge.tsx](/web/src/components/ui/badge.tsx) | TypeScript JSX | 31 | 0 | 6 | 37 |
| [web/src/components/ui/button.tsx](/web/src/components/ui/button.tsx) | TypeScript JSX | 55 | 0 | 6 | 61 |
| [web/src/components/ui/card.tsx](/web/src/components/ui/card.tsx) | TypeScript JSX | 83 | 0 | 10 | 93 |
| [web/src/components/ui/checkbox.tsx](/web/src/components/ui/checkbox.tsx) | TypeScript JSX | 26 | 0 | 5 | 31 |
| [web/src/components/ui/dialog.tsx](/web/src/components/ui/dialog.tsx) | TypeScript JSX | 130 | 0 | 14 | 144 |
| [web/src/components/ui/dropdown-menu.tsx](/web/src/components/ui/dropdown-menu.tsx) | TypeScript JSX | 239 | 0 | 19 | 258 |
| [web/src/components/ui/form.tsx](/web/src/components/ui/form.tsx) | TypeScript JSX | 143 | 0 | 25 | 168 |
| [web/src/components/ui/input.tsx](/web/src/components/ui/input.tsx) | TypeScript JSX | 18 | 0 | 4 | 22 |
| [web/src/components/ui/label.tsx](/web/src/components/ui/label.tsx) | TypeScript JSX | 20 | 0 | 5 | 25 |
| [web/src/components/ui/loading.tsx](/web/src/components/ui/loading.tsx) | TypeScript JSX | 93 | 3 | 9 | 105 |
| [web/src/components/ui/radio-group.tsx](/web/src/components/ui/radio-group.tsx) | TypeScript JSX | 39 | 0 | 6 | 45 |
| [web/src/components/ui/scroll-area.tsx](/web/src/components/ui/scroll-area.tsx) | TypeScript JSX | 43 | 0 | 6 | 49 |
| [web/src/components/ui/select.tsx](/web/src/components/ui/select.tsx) | TypeScript JSX | 172 | 0 | 14 | 186 |
| [web/src/components/ui/separator.tsx](/web/src/components/ui/separator.tsx) | TypeScript JSX | 27 | 0 | 5 | 32 |
| [web/src/components/ui/skeleton.tsx](/web/src/components/ui/skeleton.tsx) | TypeScript JSX | 13 | 0 | 3 | 16 |
| [web/src/components/ui/stepper.tsx](/web/src/components/ui/stepper.tsx) | TypeScript JSX | 58 | 0 | 7 | 65 |
| [web/src/components/ui/table.tsx](/web/src/components/ui/table.tsx) | TypeScript JSX | 105 | 0 | 12 | 117 |
| [web/src/components/ui/tabs.tsx](/web/src/components/ui/tabs.tsx) | TypeScript JSX | 59 | 0 | 8 | 67 |
| [web/src/components/ui/textarea.tsx](/web/src/components/ui/textarea.tsx) | TypeScript JSX | 15 | 0 | 4 | 19 |
| [web/src/components/ui/toast.tsx](/web/src/components/ui/toast.tsx) | TypeScript JSX | 115 | 0 | 13 | 128 |
| [web/src/components/ui/toaster.tsx](/web/src/components/ui/toaster.tsx) | TypeScript JSX | 32 | 0 | 4 | 36 |
| [web/src/components/ui/use-toast.tsx](/web/src/components/ui/use-toast.tsx) | TypeScript JSX | 159 | 3 | 31 | 193 |
| [web/src/contexts/AgentContext.tsx](/web/src/contexts/AgentContext.tsx) | TypeScript JSX | 37 | 0 | 7 | 44 |
| [web/src/instrumentation.ts](/web/src/instrumentation.ts) | TypeScript | 43 | 6 | 5 | 54 |
| [web/src/lib/actions/agent.actions.ts](/web/src/lib/actions/agent.actions.ts) | TypeScript | 322 | 24 | 80 | 426 |
| [web/src/lib/actions/analytics.actions.ts](/web/src/lib/actions/analytics.actions.ts) | TypeScript | 536 | 72 | 137 | 745 |
| [web/src/lib/actions/attendant.actions.ts](/web/src/lib/actions/attendant.actions.ts) | TypeScript | 243 | 27 | 69 | 339 |
| [web/src/lib/actions/channel.actions.ts](/web/src/lib/actions/channel.actions.ts) | TypeScript | 246 | 23 | 62 | 331 |
| [web/src/lib/actions/cms.actions.ts](/web/src/lib/actions/cms.actions.ts) | TypeScript | 191 | 13 | 35 | 239 |
| [web/src/lib/actions/invoice.actions.ts](/web/src/lib/actions/invoice.actions.ts) | TypeScript | 214 | 21 | 40 | 275 |
| [web/src/lib/actions/knowledge-base.actions.ts](/web/src/lib/actions/knowledge-base.actions.ts) | TypeScript | 60 | 13 | 16 | 89 |
| [web/src/lib/actions/knowledge.actions.ts](/web/src/lib/actions/knowledge.actions.ts) | TypeScript | 116 | 10 | 27 | 153 |
| [web/src/lib/actions/message.actions.ts](/web/src/lib/actions/message.actions.ts) | TypeScript | 503 | 19 | 82 | 604 |
| [web/src/lib/actions/payment-method.actions.ts](/web/src/lib/actions/payment-method.actions.ts) | TypeScript | 211 | 31 | 41 | 283 |
| [web/src/lib/actions/payment.actions.ts](/web/src/lib/actions/payment.actions.ts) | TypeScript | 272 | 33 | 47 | 352 |
| [web/src/lib/actions/template.actions.ts](/web/src/lib/actions/template.actions.ts) | TypeScript | 93 | 19 | 28 | 140 |
| [web/src/lib/actions/whatsapp.actions.ts](/web/src/lib/actions/whatsapp.actions.ts) | TypeScript | 88 | 18 | 18 | 124 |
| [web/src/lib/actions/wizard.actions.ts](/web/src/lib/actions/wizard.actions.ts) | TypeScript | 110 | 8 | 18 | 136 |
| [web/src/lib/billing/invoice-generator.ts](/web/src/lib/billing/invoice-generator.ts) | TypeScript | 244 | 30 | 46 | 320 |
| [web/src/lib/logger.ts](/web/src/lib/logger.ts) | TypeScript | 83 | 15 | 21 | 119 |
| [web/src/lib/plan-icons.tsx](/web/src/lib/plan-icons.tsx) | TypeScript JSX | 36 | 0 | 4 | 40 |
| [web/src/lib/security/disable-console-production.ts](/web/src/lib/security/disable-console-production.ts) | TypeScript | 75 | 20 | 15 | 110 |
| [web/src/lib/security/tenant-validation.ts](/web/src/lib/security/tenant-validation.ts) | TypeScript | 174 | 41 | 32 | 247 |
| [web/src/lib/supabase.ts](/web/src/lib/supabase.ts) | TypeScript | 18 | 6 | 3 | 27 |
| [web/src/lib/supabase/client.ts](/web/src/lib/supabase/client.ts) | TypeScript | 7 | 4 | 3 | 14 |
| [web/src/lib/supabase/server.ts](/web/src/lib/supabase/server.ts) | TypeScript | 30 | 6 | 4 | 40 |
| [web/src/lib/types/payment.types.ts](/web/src/lib/types/payment.types.ts) | TypeScript | 172 | 13 | 22 | 207 |
| [web/src/lib/utils.ts](/web/src/lib/utils.ts) | TypeScript | 5 | 0 | 2 | 7 |
| [web/src/lib/utils/analytics.ts](/web/src/lib/utils/analytics.ts) | TypeScript | 40 | 2 | 8 | 50 |
| [web/src/lib/utils/payment.utils.ts](/web/src/lib/utils/payment.utils.ts) | TypeScript | 83 | 33 | 21 | 137 |
| [web/src/middleware.ts](/web/src/middleware.ts) | TypeScript | 63 | 17 | 12 | 92 |
| [web/src/stores/agentStore.ts](/web/src/stores/agentStore.ts) | TypeScript | 120 | 5 | 20 | 145 |
| [web/src/stores/planStore.ts](/web/src/stores/planStore.ts) | TypeScript | 68 | 10 | 19 | 97 |
| [web/src/types/agent.ts](/web/src/types/agent.ts) | TypeScript | 22 | 2 | 2 | 26 |
| [web/src/types/attendant.ts](/web/src/types/attendant.ts) | TypeScript | 9 | 0 | 1 | 10 |
| [web/src/types/channel.ts](/web/src/types/channel.ts) | TypeScript | 18 | 3 | 3 | 24 |
| [web/src/types/message.ts](/web/src/types/message.ts) | TypeScript | 226 | 26 | 41 | 293 |
| [web/src/types/wizard.ts](/web/src/types/wizard.ts) | TypeScript | 40 | 3 | 5 | 48 |
| [web/tsconfig.json](/web/tsconfig.json) | JSON with Comments | 27 | 0 | 1 | 28 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)