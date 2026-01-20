from sqlmodel import Session, select
from ..models import Order, GlobalVault, VaultTransaction, VaultStage, OrderItem, Profile, UserRole
from datetime import datetime

AGENT_FEE = 20.0
MOM_GOAL = 57000.0
WOLFY_INITIAL_GOAL = 20000.0
DIZZU_PRINTER_GOAL = 57000.0
WOLFY_BONUS_GOAL = 10000.0
MAINTENANCE_GOAL = 10000.0

def calculate_order_profit(session: Session, order: Order) -> float:
    """
    Calculates net profit for a completed order.
    Profit = Total Price - Material Cost - Agent Fee
    """
    material_cost = 0.0
    for item in order.order_items:
        # volume/weight * material_cost_per_gram
        # Assuming file.weight_grams is populated
        if item.file.weight_grams:
            material_cost += item.file.weight_grams * item.material.cost_per_gram * item.quantity
    
    agent_cost = AGENT_FEE if order.agent_id else 0.0
    
    net_profit = order.total_price - material_cost - agent_cost
    return net_profit

def process_transaction(session: Session, order_id: str):
    """
    Finalizes an order transaction updates the Global Vault.
    """
    order = session.get(Order, order_id)
    if not order:
        return
    
    profit = calculate_order_profit(session, order)
    
    # Create Transaction Record
    transaction = VaultTransaction(
        order_id=order.id,
        amount=profit,
        description=f"Profit from Order {order.id}",
        investment_repayment_pool=profit # Allocating all profit to repay for now
    )
    session.add(transaction)
    
    # Update Global Vault
    # Assuming Singleton (ID known or fetch first)
    vault = session.exec(select(GlobalVault)).first()
    if not vault:
        vault = GlobalVault()
        session.add(vault)
    
    vault.total_revenue += order.total_price
    vault.total_profit += profit
    vault.investment_repaid += profit
    vault.last_updated = datetime.utcnow()
    
    # Update Stage
    repaid = vault.investment_repaid
    if repaid < MOM_GOAL:
        vault.current_stage = VaultStage.Mom
    elif repaid < MOM_GOAL + WOLFY_INITIAL_GOAL:
        vault.current_stage = VaultStage.Wolfy
    elif repaid < MOM_GOAL + WOLFY_INITIAL_GOAL + DIZZU_PRINTER_GOAL:
        vault.current_stage = VaultStage.Dizzu
    elif repaid < MOM_GOAL + WOLFY_INITIAL_GOAL + DIZZU_PRINTER_GOAL + WOLFY_BONUS_GOAL:
        vault.current_stage = VaultStage.Bonus
    else:
        vault.current_stage = VaultStage.Maint
        
    session.add(vault)
    session.commit()
