from enum import Enum

class VenueType(str, Enum):
    CLUB = "club"
    FESTIVAL = "festival"

class BookingStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    REPLIED = "replied"
    FOLLOW_UP = "follow_up"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

