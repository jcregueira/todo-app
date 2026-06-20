"""
Task routes: CRUD + filters + search.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Task, TaskStatus, TaskPriority, User
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=TaskListResponse)
def list_tasks(
    status: TaskStatus = Query(None),
    priority: TaskPriority = Query(None),
    q: str = Query(None),
    sort: str = Query("created_at"),
    order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskListResponse:
    query = db.query(Task).filter(Task.user_id == current_user.id)

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if q:
        query = query.filter(
            Task.title.ilike(f"%{q}%") | Task.description.ilike(f"%{q}%")
        )

    total = query.count()
    sort_col = getattr(Task, sort, Task.created_at)
    query = query.order_by(sort_col.desc() if order == "desc" else sort_col.asc())
    query = query.offset((page - 1) * limit).limit(limit)

    return TaskListResponse(data=query.all(), total=total, page=page, limit=limit)


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = Task(**data.model_dump(), user_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = data.model_dump(exclude_unset=True)

    # Auto-set completed_at when status changes to completed
    if update_data.get("status") == TaskStatus.COMPLETED and task.status != TaskStatus.COMPLETED:
        update_data["completed_at"] = datetime.now(timezone.utc)
    elif "status" in update_data and update_data["status"] != TaskStatus.COMPLETED:
        update_data["completed_at"] = None

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


@router.get("/overdue/list", response_model=TaskListResponse)
def list_overdue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskListResponse:
    now = datetime.now(timezone.utc)
    query = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == TaskStatus.PENDING,
            Task.due_date < now,
        )
        .order_by(Task.due_date.asc())
    )
    return TaskListResponse(data=query.all(), total=query.count(), page=1, limit=len(query.all()))
