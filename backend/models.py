from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship, Enum as SQLModelEnum
import enum

# Enums
class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    campus_admin = "campus_admin"
    customer = "customer"

class PrinterStatus(str, enum.Enum):
    idle = "idle"
    printing = "printing"
    error = "error"
    offline = "offline"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    processing = "processing"
    completed = "completed"
    delivered = "delivered"

class JobStatus(str, enum.Enum):
    queued = "queued"
    printing = "printing"
    success = "success"
    failure = "failure"

class VaultStage(str, enum.Enum):
    Mom = "Mom"
    Wolfy = "Wolfy"
    Dizzu = "Dizzu"
    Bonus = "Bonus"
    Maint = "Maint"

# Models

class Profile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    role: UserRole = Field(default=UserRole.customer)
    auth_id: str = Field(unique=True, index=True) # Linked to Supabase Auth UUID

    # Relationships
    files: List["File"] = Relationship(back_populates="user")
    orders: List["Order"] = Relationship(back_populates="user", sa_relationship_kwargs={"primaryjoin": "Order.user_id==Profile.id"})
    agent_orders: List["Order"] = Relationship(back_populates="agent", sa_relationship_kwargs={"primaryjoin": "Order.agent_id==Profile.id"})

class Campus(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    location: str
    
    printers: List["Printer"] = Relationship(back_populates="campus")
    orders: List["Order"] = Relationship(back_populates="campus")

class Printer(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    campus_id: UUID = Field(foreign_key="campus.id")
    status: PrinterStatus = Field(default=PrinterStatus.idle)
    model: str
    
    campus: Campus = Relationship(back_populates="printers")
    print_jobs: List["PrintJob"] = Relationship(back_populates="printer")

class Material(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    type: str
    color: str
    cost_per_gram: float
    price_per_gram: float
    is_exotic: bool = Field(default=False)
    
    order_items: List["OrderItem"] = Relationship(back_populates="material")

class File(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="profile.id")
    storage_path: str
    filename: str
    upload_time: datetime = Field(default_factory=datetime.utcnow)
    weight_grams: Optional[float] = None
    print_time_seconds: Optional[int] = None
    
    user: Profile = Relationship(back_populates="files")
    order_items: List["OrderItem"] = Relationship(back_populates="file")

class Order(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="profile.id")
    campus_id: UUID = Field(foreign_key="campus.id")
    agent_id: Optional[UUID] = Field(default=None, foreign_key="profile.id")
    status: OrderStatus = Field(default=OrderStatus.pending)
    total_price: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Profile = Relationship(back_populates="orders", sa_relationship_kwargs={"foreign_keys": "[Order.user_id]"})
    campus: Campus = Relationship(back_populates="orders")
    agent: Optional[Profile] = Relationship(back_populates="agent_orders", sa_relationship_kwargs={"foreign_keys": "[Order.agent_id]"})
    order_items: List["OrderItem"] = Relationship(back_populates="order")
    vault_transactions: List["VaultTransaction"] = Relationship(back_populates="order")

class OrderItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_id: UUID = Field(foreign_key="order.id")
    file_id: UUID = Field(foreign_key="file.id")
    material_id: UUID = Field(foreign_key="material.id")
    quantity: int = Field(default=1)
    # slicing_config could be JSON, storing as string for compatibility or use SA JSON type
    slicing_config: Optional[str] = None 
    
    order: Order = Relationship(back_populates="order_items")
    file: File = Relationship(back_populates="order_items")
    material: Material = Relationship(back_populates="order_items")
    print_job: Optional["PrintJob"] = Relationship(back_populates="order_item")

class PrintJob(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_item_id: UUID = Field(foreign_key="orderitem.id")
    printer_id: UUID = Field(foreign_key="printer.id")
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: JobStatus = Field(default=JobStatus.queued)
    photo_url: Optional[str] = None
    
    order_item: OrderItem = Relationship(back_populates="print_job")
    printer: Printer = Relationship(back_populates="print_jobs")

class VaultTransaction(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_id: UUID = Field(foreign_key="order.id")
    amount: float
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    investment_repayment_pool: float
    
    order: Order = Relationship(back_populates="vault_transactions")

class GlobalVault(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    total_revenue: float = Field(default=0.0)
    total_profit: float = Field(default=0.0)
    investment_repaid: float = Field(default=0.0)
    current_stage: VaultStage = Field(default=VaultStage.Mom)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
