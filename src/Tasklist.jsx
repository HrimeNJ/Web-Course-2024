import React, { useState, useEffect } from "react";
import "./Tasklist.css";
import Modal from './Modal'; 
import TaskDetailsModal from './TaskDetailsModal';

const TaskList = ({ tasks, columnId, getTaskFile, onDragStart, onDragOver, onDrop, updateTask }) => {
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskEditContent, setTaskEditContent] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskEvaluation, setTaskEvaluation] = useState("");
    const [showOptions, setShowOptions] = useState(null);
    const [showButton, setShowButton] = useState(true);
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState(null);


    useEffect(() => {
        console.log("tasks in Tasklist: " , tasks);
    });
    //任务编辑
    const handleTaskEditChange = (event) => {
        setTaskEditContent(event.target.value);
    };

    //任务描述
    const handleDescriptionChange = (event) => {
        setTaskDescription(event.target.value);
    };

    //任务评论
    const handleEvaluationChange = (event) => {
        setTaskEvaluation(event.target.value);
    };

    //任务附件
    const handleAttachmentChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setAttachmentFile(event.target.files[0]);
            console.log("File uploaded: ", event.target.files[0].name);
        } else {
            console.log("No file selected");
        }
    };
    

    //任务编辑提交
    const handleTaskEditSubmit = (taskId) => {
        const updatedTask = {
            content: taskEditContent,
            description: taskDescription,
            evaluation: taskEvaluation,
            hasattachmentFile: attachmentFile ? true : false,
        };
        updateTask(columnId, taskId, updatedTask);
        setEditingTaskId(null); 
        setShowButton(true);
        
        if (attachmentFile) {
            console.log(attachmentFile.name);
            const sanitizedFileName = attachmentFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_'); // 替换非法字符
            const formData = new FormData();
            formData.append("attachment", attachmentFile, sanitizedFileName);
            console.log(formData.get("attachment"));
            
            fetch(`http://localhost:7001/upload/${taskId}`, {
                method: "POST",
                body: formData,
            })
            .then((response) => response.json())
            .then((data) => console.log("File uploaded successfully: ", data))
            .catch(error => console.log("File upload fail ", error));
        }

        setAttachmentFile(null);
        // setShowModal(false);
    };

    const handleCloseModal = () =>{
        setShowButton(true);
        setShowModal(false);
        setTaskToEdit(null);
        setAttachmentFile(null);
        setEditingTaskId(null); 
    }

    //任务选择的点击
    const handleOptionsClick = (taskId) => {
        setShowOptions(showOptions === taskId ? null : taskId);
    };

    //任务编辑的点击
    const handleEditClick = (task) => {
        //先保存现有的task
        setEditingTaskId(task.id);
        setTaskEditContent(task.content);
        setTaskDescription(task.description);
        setTaskEvaluation(task.evaluation);
        setAttachmentFile(attachmentFile);  //这个地方应该是task本身的attachment而不是attachment变量，先这样后面改

        setShowOptions(null);
        setShowButton(false);
        setShowModal(true);
        setTaskToEdit(task);
    };

    //任务查看的点击
    const handleViewClick = (task) => {
        setSelectedTask(task);
        setShowOptions(null);
        setShowButton(true);
    };

    const handleCloseViewModal = () =>{
        setSelectedTask(null);
    }

    //任务删除的点击
    const handleDeleteClick = (task) => {
        updateTask(columnId, task.id, null);
        setShowOptions(null);
        setShowButton(true);
    };

    //回车处理
    const handleKeyDown = (event, taskId) => {
        if (event.key === "Enter") {
            handleTaskEditSubmit(taskId);
        }
    };

    return (
        <>
            <ul className="tasklist" id={columnId}
                onDragOver={(event) => onDragOver(event)}
                onDrop={(event) => onDrop(event, columnId)}>
                {tasks && tasks.length > 0 ? 
                    (tasks.map((task) => (
                        <li key={task.id} className="task"
                            draggable
                            onDragStart={(event) => onDragStart(event, task.id, columnId)}>
                            
                            <p>{task.content}</p>
  
                            {showButton && <button 
                                className="options-button" onClick={() => handleOptionsClick(task.id)}>⋮</button>}
                            
                            {showOptions === task.id && (
                                <div className="options-menu">
                                    <button onClick={() => handleViewClick(task)}>查看</button>
                                    <button onClick={() => handleEditClick(task)}>修改</button>
                                    <button onClick={() => handleDeleteClick(task)}>删除</button>
                                </div>
                            )}
                        </li>
                    )))
                    : (<li className="task" id="Notask">没有任务</li>)
                }
            </ul>

            {/* 显示弹窗 */}
            <Modal show={showModal} onClose={handleCloseModal}>
                {taskToEdit && (
                    <form className="taskform" onSubmit={(event) => 
                    {event.preventDefault(); handleTaskEditSubmit(taskToEdit.id); handleCloseModal();} }>
                    <input
                        type="text"
                        value={taskEditContent}
                        onChange={handleTaskEditChange}
                        onKeyDown={(event) => handleKeyDown(event, taskToEdit.id)}
                    />
                    <textarea
                        placeholder="任务描述"
                        value={taskDescription}
                        onChange={handleDescriptionChange}
                    />
                    <input
                        type="text"
                        placeholder="任务评价"
                        value={taskEvaluation}
                        onChange={handleEvaluationChange}
                    />
                    <input
                        type="file"
                        onChange={handleAttachmentChange}
                    />
                    <button className="tasksubmit" type="submit">提交</button>
                    </form>
                )}
            </Modal>

            {/* 显示任务详情 */}
            {selectedTask && (
                <TaskDetailsModal 
                    task={selectedTask} 
                    onClose={handleCloseViewModal} 
                    getTaskFile={getTaskFile}
                />
            )}
        </>
    );
};

export default TaskList;
