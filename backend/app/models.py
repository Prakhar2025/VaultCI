import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.database import Base


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(String(255), unique=True, nullable=False)  # "owner/repo"
    github_token = Column(Text, nullable=True)
    webhook_secret = Column(Text, nullable=True)
    security_threshold = Column(Float, default=0.85)
    arch_threshold = Column(Float, default=0.65)
    blast_threshold = Column(Integer, default=20)
    created_at = Column(DateTime, default=datetime.utcnow)


class PRTrustReport(Base):
    __tablename__ = "pr_trust_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(String(255), nullable=False)
    pr_number = Column(Integer, nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    trust_score = Column(Float, nullable=False)
    gate_decision = Column(String(20), nullable=False)  # TRUSTED|REVIEW|CAUTION|BLOCK
    security_score = Column(Float, nullable=True)
    arch_score = Column(Float, nullable=True)
    blast_score = Column(Float, nullable=True)
    rejected_score = Column(Float, nullable=True)
    ai_penalty = Column(Float, nullable=True)
    report_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DependencyGraphSnapshot(Base):
    __tablename__ = "dependency_graph_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(String(255), nullable=False)
    snapshot_date = Column(DateTime, nullable=False)
    graph_json = Column(JSONB, nullable=False)
    centrality_map = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
