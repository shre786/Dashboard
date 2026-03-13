import openpyxl
import re
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware
from core.models import Dashboard_sheet
from django.contrib.auth import get_user_model
from dateutil import parser 

User = get_user_model()


class Command(BaseCommand):
    help = "Import Dashboard Excel data into database"

    def handle(self, *args, **kwargs):

        file_path = "Dashboard.xlsx"
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

                # --------------------------
                # Extract POC Details
                # --------------------------
                poc_raw = get_value("Point of Contact")

                phone = None
                email = None
                point_of_contact = None

                if poc_raw:
                    poc_raw = str(poc_raw)

                    email_match = re.search(r'[\w\.-]+@[\w\.-]+', poc_raw)
                    if email_match:
                        email = email_match.group(0)

                    digits = re.sub(r'\D', '', poc_raw)
                    if 10 <= len(digits) <= 15:
                        phone = digits

                    point_of_contact = poc_raw.split(",")[0].strip()

                # --------------------------
                # Meeting Date
                # --------------------------
                meeting_date = None
                meeting_date_raw = get_value("Meeting Dates")

                if meeting_date_raw:
                    try:
                        if isinstance(meeting_date_raw, datetime):
                            parsed = meeting_date_raw
                        else:
                            parsed = parser.parse(str(meeting_date_raw))

                        if parsed.tzinfo is None:
                            meeting_date = make_aware(parsed)
                        else:
                            meeting_date = parsed
                    except Exception:
                        meeting_date = None

                # --------------------------
    # Follow Up Dates
# --------------------------
                def parse_date(value):
                    if not value:
                        return None
                    try:
                        if isinstance(value, datetime):
                            parsed = value
                        else:
                            parsed = parser.parse(str(value))

                        if parsed.tzinfo is None:
                            return make_aware(parsed)
                        return parsed
                    except Exception:
                        return None


                follow_up_1 = parse_date(get_value("Follow_up 1"))
                follow_up_2 = parse_date(get_value("Follow_up 2"))
                follow_up_3 = parse_date(get_value("Follow_up 3"))


                # --------------------------
                # Other Fields
                # --------------------------
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
                        "follow_up_1": follow_up_1,
                        "follow_up_2": follow_up_2,
                        "follow_up_3": follow_up_3,
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