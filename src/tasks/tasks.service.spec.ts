import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CreateTaskDto } from './dto/create-task.dto'
import { GetTaskFilterDto } from './dto/get-tasks-filter.dto'
import { TaskStatus } from './task-status.enum'
import { Task } from './task.entity'
import { TaskRepository } from './tasks.repository'
import { TasksService } from './tasks.service'

const mockUser = { id: 12, username: 'Test user' }
const mockTask = { title: 'Test', description: 'Test' }

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
})

describe('TaskService', () => {
  let tasksService
  let taskRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile()

    tasksService = await module.get<TasksService>(TasksService)
    taskRepository = await module.get<TaskRepository>(TaskRepository)
  })

  describe('getTasks', () => {
    it('should gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue')

      expect(taskRepository.getTasks).not.toHaveBeenCalled()
      const filters: GetTaskFilterDto = {
        search: 'Some search query',
        status: TaskStatus.IN_PROGRESS,
      }
      const result = await tasksService.getTasks(filters, mockUser)
      expect(taskRepository.getTasks).toHaveBeenCalled()
      expect(result).toEqual('someValue')
    })
  })

  describe('getTaskById', () => {
    it('should calls taskRepository.findOne() and successfully retrive and return task', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask)

      const result = await tasksService.getTaskById(1, mockUser)
      expect(result).toEqual(mockTask)

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      })
    })

    it('should throws an error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null)
      expect(tasksService.getTaskById(mockUser)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('createTask', () => {
    it('should calls taskRepository.creat() and return the result', async () => {
      taskRepository.createTask.mockResolvedValue('Some Task')
      expect(taskRepository.createTask).not.toHaveBeenCalled()

      const result = await tasksService.createTask(mockTask, mockUser)
      expect(taskRepository.createTask).toHaveBeenCalledWith(mockTask, mockUser)
      expect(result).toEqual('Some Task')
    })
  })

  // describe('deleteTask', () => {
  //   it('should calls taskRepository.deleteTask() to delete a task', async () => {
  //     taskRepository.delete.mockResolvedValue({ affected: 1 })
  //     expect(taskRepository.delete).not.toHaveBeenCalled()
  //     await tasksService.deleteTask(1, mockUser)
  //     expect(taskRepository.delete).toHaveBeenCalledWith({
  //       id: 1,
  //       userId: mockUser.id,
  //     })
  //   })

  //   it('should throws an error as task could not be found', () => {
  //     taskRepository.delete.mockResolvedValue({ affected: 0 })
  //     expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow()
  //   })
  // })

  describe('updateTaskStatus', () => {
    it('should updates a task status', async () => {
      const save = jest.fn().mockResolvedValue(true)
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      })

      expect(tasksService.getTaskById).not.toHaveBeenCalled()
      expect(save).not.toHaveBeenCalled()
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      )
      expect(tasksService.getTaskById).toHaveBeenCalled()
      expect(save).toHaveBeenCalled()
      expect(result.status).toEqual(TaskStatus.DONE)
    })
  })
})
