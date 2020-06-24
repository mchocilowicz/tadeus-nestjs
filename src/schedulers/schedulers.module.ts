import { Module } from "@nestjs/common";
import { CreateNewUserPeriodScheduler } from "./create-new-user-period.scheduler";
import { DisableEditPartnerPeriodScheduler } from "./disable-edit-partner-period.scheduler";
import { SendEmailsToPartnersScheduler } from "./send-emails-to-partners.scheduler";
import { UserAccountExpirationScheduler } from "./user-account-expiration.scheduler";
import { ScheduleModule } from "@nestjs/schedule";
import { CodeService } from "../common/service/code.service";
import { EmailService } from "../module/common/email.service";

@Module({
    imports: [ScheduleModule.forRoot(),],
    providers: [CreateNewUserPeriodScheduler, DisableEditPartnerPeriodScheduler, SendEmailsToPartnersScheduler, UserAccountExpirationScheduler, CodeService, EmailService]
})
export class SchedulersModule {
}
