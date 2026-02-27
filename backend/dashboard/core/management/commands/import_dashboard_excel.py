import openpyxl
import re
from django.core.management.base import BaseCommand
from core.models import Dashboard_sheet
from django.contrib.auth import get_user_model
from datetime import datetime

User = get_user_model()


class Command(BaseCommand):
    help = "Import Dashboard Excel data into database"

    def handle(self, *args, **kwargs):

        file_path = "Dashboard - Sheet1.xlsx"
        workbook = openpyxl.load_workbook(file_path)
        sheet = workbook.active

        # Clean headers
        raw_headers = [cell.value for cell in sheet[1]]
        headers = [str(h).strip() if h else "" for h in raw_headers]

        print("Excel Headers Found:", headers)

        user = User.objects.first()

        success = 0
        skipped = 0
        errors = 0

        for row in sheet.iter_rows(min_row=2, values_only=True):

            if not any(row):
                skipped += 1
                continue

            try:
                row_data = dict(zip(headers, row))

                # Case-insensitive safe getter
                def get_value(key):
                    for k in row_data.keys():
                        if k and k.strip().lower() == key.lower():
                            return row_data.get(k)
                    return None

                company_name = get_value("Company Name")
                if not company_name:
                    skipped += 1
                    continue

                poc_raw = get_value("Point of Contact")

                phone = None
                email = None
                point_of_contact = None

                if poc_raw:
                    poc_raw = str(poc_raw)

                    # Extract email
                    email_match = re.search(r'[\w\.-]+@[\w\.-]+', poc_raw)
                    if email_match:
                        email = email_match.group(0)

                    # Extract phone digits
                    digits = re.sub(r'\D', '', poc_raw)
                    if 10 <= len(digits) <= 15:
                        phone = digits

                    # Extract name
                    point_of_contact = poc_raw.split(",")[0].strip()

                # Meeting Date
                meeting_date = None
                meeting_date_raw = get_value("Meeting Dates")
                if isinstance(meeting_date_raw, datetime):
                    meeting_date = meeting_date_raw

                quotation_value = get_value("Quotation")
                meeting_discussion_value = get_value("Meeting Discussion")

                Dashboard_sheet.objects.update_or_create(
                    company_name=str(company_name).strip(),
                    defaults={
                        "initiated": bool(get_value("Initiated")),
                        "company_domain": get_value("Company Domain") or "",
                        "company_website": (get_value("Company Website") or "").strip(),
                        "point_of_contact": point_of_contact or "",
                        "email": email,
                        "phone": phone,
                        "reply": get_value("Reply") or "",
                        "response": get_value("Response") or "",
                        "planning_to_offer": get_value("Planning to Offer") or "",
                        "availability_for_meeting": (
                            get_value("Availability for Meeting")
                            or get_value("Availability for Metting")
                            or ""
                        ),
                        "meeting_date": meeting_date,
                        "meeting_1": get_value("Meeting 1") or "",
                        "meeting_2": get_value("Meeting 2") or "",
                        "meeting_discussion": (
                            str(meeting_discussion_value).strip()
                            if meeting_discussion_value else ""
                        ),
                        "quotation": (
                            str(quotation_value).strip()
                            if quotation_value else ""
                        ),
                        "follow_ups": get_value("Follow-Ups( Mail, Call )") or "",
                        "status": get_value("Status") or None,
                        "updated_by": user,
                    }
                )

                success += 1

            except Exception as e:
                errors += 1
                self.stdout.write(
                    self.style.ERROR(
                        f"Error on company '{company_name}': {str(e)}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nImport Completed | Success: {success} | Skipped: {skipped} | Errors: {errors}"
            )
        )