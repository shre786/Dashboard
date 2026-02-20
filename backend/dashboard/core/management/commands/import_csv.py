import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from core.models import Dashboard_sheet


class Command(BaseCommand):
    help = 'Import data from CSV file to Dashboard_sheet model'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                
                created_count = 0
                updated_count = 0
                error_count = 0
                
                for row in csv_reader:
                    try:
                        # Parse initiated field
                        initiated_value = row.get('Initiated', '').strip().lower()
                        initiated = initiated_value not in ['', 'na', 'false', '0']
                        
                        # Parse meeting_date
                        meeting_date = None
                        meeting_dates_str = row.get('Meeting Dates', '').strip()
                        if meeting_dates_str and meeting_dates_str.upper() != 'NA':
                            # Try to parse the date - handle various formats
                            try:
                                from django.utils import timezone
                                # Try format: "Mon 16 Feb 2026 2pm – 3pm (IST)"
                                if 'Feb' in meeting_dates_str or 'Jan' in meeting_dates_str or 'Dec' in meeting_dates_str:
                                    parts = meeting_dates_str.split()
                                    for i, part in enumerate(parts):
                                        if part.isdigit() and i+1 < len(parts):
                                            day = int(part)
                                            month_str = parts[i+1]
                                            if i+2 < len(parts) and parts[i+2].isdigit():
                                                year = int(parts[i+2])
                                                month_map = {
                                                    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
                                                    'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
                                                    'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                }
                                                month = month_map.get(month_str, None)
                                                if month:
                                                    meeting_date = timezone.make_aware(
                                                        datetime(year, month, day, 14, 0, 0)
                                                    )
                                                    break
                                # Try standard format: "DD/MM/YYYY"
                                elif '/' in meeting_dates_str:
                                    date_part = meeting_dates_str.split()[0]
                                    parsed_date = datetime.strptime(date_part, '%d/%m/%Y')
                                    meeting_date = timezone.make_aware(
                                        datetime(parsed_date.year, parsed_date.month, parsed_date.day, 14, 0, 0)
                                    )
                            except (ValueError, IndexError):
                                self.stdout.write(self.style.WARNING(
                                    f'Could not parse date: {meeting_dates_str} for {row.get("Company Name", "Unknown")}'
                                ))
                        
                        # Create or update the record
                        company_name = row.get('Company Name', '').strip()
                        
                        if company_name:
                            dashboard_entry, created = Dashboard_sheet.objects.update_or_create(
                                company_name=company_name,
                                defaults={
                                    'initiated': initiated,
                                    'company_domain': row.get('Company Domain', '').strip(),
                                    'company_website': row.get('Company Website', '').strip() or 'http://example.com',
                                    'point_of_contact': row.get('Point of Contact', '').strip(),
                                    'reply': row.get('Reply', '').strip() or None,
                                    'response': row.get('Response', '').strip() or None,
                                    'planning_to_offer': row.get('Planning to Offer', '').strip() or None,
                                    'availability_for_meeting': row.get('Availability for Metting', '').strip() or None,
                                    'meeting_date': meeting_date,
                                    'proposed': row.get('Proposed', '').strip() or None,
                                    'meeting_1': row.get('Meeting 1', '').strip() or None,
                                    'meeting_2': row.get('Meeting 2', '').strip() or None,
                                    'quotation': row.get('Quotation', '').strip() or None,
                                    'follow_ups': row.get('Follow-Ups( Mail, Call )', '').strip() or None,
                                    'status': row.get('Status', '').strip() or None,
                                }
                            )
                            
                            if created:
                                created_count += 1
                            else:
                                updated_count += 1
                        else:
                            error_count += 1
                            self.stdout.write(self.style.WARNING(
                                f'Skipping row with empty company name'
                            ))
                            
                    except Exception as e:
                        error_count += 1
                        self.stdout.write(self.style.ERROR(
                            f'Error processing row for {row.get("Company Name", "Unknown")}: {str(e)}'
                        ))
                
                self.stdout.write(self.style.SUCCESS(
                    f'\nImport completed!'
                ))
                self.stdout.write(f'Records created: {created_count}')
                self.stdout.write(f'Records updated: {updated_count}')
                self.stdout.write(f'Errors: {error_count}')
                
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(
                f'File not found: {csv_file_path}'
            ))
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Error reading CSV file: {str(e)}'
            ))
