from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey, JSON, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # 'poster', 'doer', 'admin'
    department = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    reward = Column(Numeric(precision=10, scale=2), nullable=False)
    reward_type = Column(String(20), nullable=False)  # 'credits', 'cash'
    posted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    department = Column(String(50))
    estimated_time = Column(String(50))
    skills_required = Column(JSON)
    status = Column(String(20), default="open")  # 'open', 'in_progress', 'completed'
    is_featured = Column(Boolean, default=False)
    image_url = Column(String(500))
    created_at = Column(TIMESTAMP, server_default=func.now())

class CaseStudy(Base):
    __tablename__ = "case_studies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    problem = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    time_to_deliver = Column(Integer, nullable=False)  # in minutes
    difficulty_level = Column(String(20), nullable=False)  # 'easy', 'medium', 'hard'
    tags = Column(JSON)
    image_url = Column(String(500))
    created_at = Column(TIMESTAMP, server_default=func.now())

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    applicant_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String(20), default="pending")  # pending, accepted, rejected, completed
    submitted_work = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())