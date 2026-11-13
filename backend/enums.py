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
    
class EpkContent(str, Enum):
    PHOTOS = "photos"
    AUDIO = "audio"
    VIDEOS = "videos"
    STAGE_PLAN = "stage_plan"
    TECH_RIDER = "tech_rider"
    SHORT_BIO = "short_bio"
    LONG_BIO = "long_bio"


class EmailStyleAttribute(str, Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FORMAL = "formal"
    WARM = "warm"
    PERSONAL = "personal"
    DIRECT = "direct"
    CONCISE = "concise"
    CONFIDENT = "confident"
    ENTHUSIASTIC = "enthusiastic"
    UNDERSTATED = "understated"
    INVITING = "inviting"
    RESPECTFUL = "respectful"
    VIVID = "vivid"
    GROUNDED = "grounded"
    ELEGANT = "elegant"
    CURIOUS = "curious"
    
class EmailDraftStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    SENT = "sent"


    
