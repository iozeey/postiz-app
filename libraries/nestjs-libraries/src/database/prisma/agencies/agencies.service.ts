import { Injectable } from '@nestjs/common';
import { AgenciesRepository } from '@gitroom/nestjs-libraries/database/prisma/agencies/agencies.repository';
import { User } from '@prisma/client';
import { CreateAgencyDto } from '@gitroom/nestjs-libraries/dtos/agencies/create.agency.dto';

@Injectable()
export class AgenciesService {
  constructor(private _agenciesRepository: AgenciesRepository) {}
  getAgencyByUser(user: User) {
    return this._agenciesRepository.getAgencyByUser(user);
  }

  getCount() {
    return this._agenciesRepository.getCount();
  }

  getAllAgencies() {
    return this._agenciesRepository.getAllAgencies();
  }

  getAllAgenciesSlug() {
    return this._agenciesRepository.getAllAgenciesSlug();
  }

  getAgencyInformation(agency: string) {
    return this._agenciesRepository.getAgencyInformation(agency);
  }

  // Upstream mailed its own nevo@postiz.com inbox on every new agency,
  // with approve/decline links back to postiz.com, and told the agency owner
  // they were listed on postiz.com. None of that is this instance's directory,
  // so the review state is still recorded but no email is sent.
  async approveOrDecline(email: string, action: string, id: string) {
    await this._agenciesRepository.approveOrDecline(action, id);
  }

  async createAgency(user: User, body: CreateAgencyDto) {
    return this._agenciesRepository.createAgency(user, body);
  }
}
