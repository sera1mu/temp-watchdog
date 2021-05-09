import dayjs from 'dayjs';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export class Sheets {
  private doc: GoogleSpreadsheet;

  constructor(sheetId: string) {
    this.doc = new GoogleSpreadsheet(sheetId);
  }

  /**
   * Prepare sheet
   */
  async prepare(client_email: string, private_key: string, sheetTitleFormat: string): Promise<void> {
    // Authentication
    await this.doc.useServiceAccountAuth({
      client_email,
      private_key
    });
    // Load info
    await this.doc.loadInfo();

    if(!(await this.isExistsThisMonthSheet(sheetTitleFormat))) {
      await this.createThisMonthSheet(sheetTitleFormat);
    }
  }

  /**
   * Create this month sheet.
   */
  async createThisMonthSheet(sheetTitleFormat: string): Promise<void> {
    if(await this.isExistsThisMonthSheet(sheetTitleFormat)) {
      throw new Error('This month sheet is already created.');
    } else {
      await this.doc.addSheet({ title: Sheets.getThisMonthSheetName(sheetTitleFormat), headerValues: ['日時', '温度', '湿度']});
    }
  }

  /**
   * Check exists this month sheet
   * @param sheetTitleFormat In configuration
   */
  async isExistsThisMonthSheet(sheetTitleFormat: string): Promise<boolean> {
    const shouldExistsSheetTitle = Sheets.getThisMonthSheetName(sheetTitleFormat);
    const latestSheet = this.doc.sheetsByTitle[shouldExistsSheetTitle];
    if(typeof latestSheet === 'undefined') {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Add record to sheet
   * @param sheetTitleFormat In configuration
   */
  async addRecord(timeStamp: string, temperature: number, humidity: number, sheetTitleFormat: string): Promise<void> {
    if(!(await this.isExistsThisMonthSheet(sheetTitleFormat))) {
      throw new Error('This month sheet has not been created. Run <Sheet>.createThisMonthSheet() before run this.');
    }

    const sheet = this.doc.sheetsByTitle[Sheets.getThisMonthSheetName(sheetTitleFormat)];
    const record = await sheet.addRow({ '日時': timeStamp, '温度': temperature, '湿度': humidity });
    return record.save();
  }

  /**
   * Get this month sheet name
   * @param sheetTitleFormat In configuration
   */
  static getThisMonthSheetName(sheetTitleFormat: string): string {
    return dayjs().format(sheetTitleFormat);
  }
}