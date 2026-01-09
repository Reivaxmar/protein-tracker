import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { formatProtein, formatDate } from '../utils/helpers';

type ViewMode = 'daily' | 'weekly' | 'monthly';

export default function HistoryScreen() {
  const t = useLanguageStore((state) => state.translations);
  const language = useLanguageStore((state) => state.language);
  const dailyProteinData = useProteinStore((state) => state.dailyProteinData);
  const targetProtein = useProteinStore((state) => state.targetProtein);
  
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Validate and set date
  const handleDateChange = (dateString: string) => {
    // Update the input immediately for typing experience
    setSelectedDate(dateString);
    
    // Validate the date format and value
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateString)) {
      const date = new Date(dateString);
      // Check if date is valid (not NaN) and matches the input
      if (!isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateString) {
        // Date is valid, it will be used by the views
        return;
      }
    }
    // Invalid date, but we keep the input as-is for user to correct
  };
  
  // Get dates for weekly view (Monday to Sunday)
  const getWeekDates = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(date);
    monday.setDate(diff);
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
      weekDates.push(currentDate.toISOString().split('T')[0]);
    }
    return weekDates;
  };
  
  // Get dates for monthly view
  const getMonthDates = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const monthDates: string[] = [];
    for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
      const currentDate = new Date(year, month, d);
      monthDates.push(currentDate.toISOString().split('T')[0]);
    }
    return monthDates;
  };
  
  // Navigate to previous/next date period
  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    
    if (viewMode === 'daily') {
      date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'weekly') {
      date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'monthly') {
      date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setSelectedDate(date.toISOString().split('T')[0]);
  };
  
  // Calculate weekly aggregated data
  const weeklyData = useMemo(() => {
    const weekDates = getWeekDates(selectedDate);
    const daysWithData = weekDates.filter(date => dailyProteinData[date]);
    
    if (daysWithData.length === 0) {
      return null;
    }
    
    const totalProtein = daysWithData.reduce((sum, date) => 
      sum + (dailyProteinData[date]?.totalProtein || 0), 0
    );
    
    const averageProtein = totalProtein / daysWithData.length;
    
    const dailyBreakdown = weekDates.map(date => ({
      date,
      data: dailyProteinData[date],
    }));
    
    return {
      totalProtein,
      averageProtein,
      daysTracked: daysWithData.length,
      dailyBreakdown,
      weekStart: weekDates[0],
      weekEnd: weekDates[6],
    };
  }, [selectedDate, dailyProteinData]);
  
  // Calculate monthly aggregated data
  const monthlyData = useMemo(() => {
    const monthDates = getMonthDates(selectedDate);
    const daysWithData = monthDates.filter(date => dailyProteinData[date]);
    
    if (daysWithData.length === 0) {
      return null;
    }
    
    const totalProtein = daysWithData.reduce((sum, date) => 
      sum + (dailyProteinData[date]?.totalProtein || 0), 0
    );
    
    const averageProtein = totalProtein / daysWithData.length;
    
    const dailyBreakdown = monthDates.map(date => ({
      date,
      data: dailyProteinData[date],
    }));
    
    return {
      totalProtein,
      averageProtein,
      daysTracked: daysWithData.length,
      dailyBreakdown,
      monthName: new Date(selectedDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
    };
  }, [selectedDate, dailyProteinData, language]);
  
  // Render daily view
  const renderDailyView = () => {
    const dayData = dailyProteinData[selectedDate];
    
    return (
      <View style={styles.viewContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{formatDate(selectedDate, language)}</Text>
          
          {!dayData || dayData.meals.length === 0 ? (
            <Text style={styles.emptyText}>{t.history.noDataForDate}</Text>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{t.history.totalProtein}</Text>
                  <Text style={styles.statValue}>{formatProtein(dayData.totalProtein)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>{t.history.target}</Text>
                  <Text style={styles.statValue}>{formatProtein(targetProtein)}</Text>
                </View>
              </View>
              
              <View style={styles.mealsSection}>
                <Text style={styles.sectionTitle}>{t.history.meals} ({dayData.meals.length})</Text>
                {dayData.meals.map((meal) => (
                  <View key={meal.id} style={styles.mealItem}>
                    <View style={styles.mealInfo}>
                      <View style={styles.mealNameRow}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        {meal.tag && (
                          <View style={styles.mealTag}>
                            <Text style={styles.mealTagText}>{meal.tag}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.mealDetails}>
                        {meal.gramsEaten}g ({meal.proteinPer100g}g/100g)
                      </Text>
                    </View>
                    <Text style={styles.mealProtein}>{formatProtein(meal.totalProtein)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };
  
  // Render weekly view
  const renderWeeklyView = () => {
    if (!weeklyData) {
      return (
        <View style={styles.viewContainer}>
          <View style={styles.card}>
            <Text style={styles.emptyText}>{t.history.noDataForWeek}</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.viewContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {t.history.weekOf} {formatDate(weeklyData.weekStart, language)}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.history.average}</Text>
              <Text style={styles.statValue}>{formatProtein(weeklyData.averageProtein)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.history.daysTracked}</Text>
              <Text style={styles.statValue}>{weeklyData.daysTracked}/7</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.history.totalProtein}</Text>
              <Text style={styles.statValue}>{formatProtein(weeklyData.totalProtein)}</Text>
            </View>
          </View>
          
          <View style={styles.dailyBreakdownSection}>
            <Text style={styles.sectionTitle}>{t.history.daily}</Text>
            {weeklyData.dailyBreakdown.map(({ date, data }) => (
              <TouchableOpacity
                key={date}
                style={styles.dayRow}
                onPress={() => {
                  setSelectedDate(date);
                  setViewMode('daily');
                }}
              >
                <Text style={styles.dayDate}>
                  {new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                {data ? (
                  <View style={styles.dayDataContainer}>
                    <Text style={styles.dayProtein}>{formatProtein(data.totalProtein)}</Text>
                    <Text style={styles.dayMeals}>
                      {data.meals.length} {data.meals.length === 1 ? t.history.meal : t.history.meals}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noData}>-</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };
  
  // Render monthly view
  const renderMonthlyView = () => {
    if (!monthlyData) {
      return (
        <View style={styles.viewContainer}>
          <View style={styles.card}>
            <Text style={styles.emptyText}>{t.history.noDataForMonth}</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.viewContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{monthlyData.monthName}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.history.average}</Text>
              <Text style={styles.statValue}>{formatProtein(monthlyData.averageProtein)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.history.daysTracked}</Text>
              <Text style={styles.statValue}>{monthlyData.daysTracked}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.history.totalProtein}</Text>
              <Text style={styles.statValue}>{formatProtein(monthlyData.totalProtein)}</Text>
            </View>
          </View>
          
          <View style={styles.dailyBreakdownSection}>
            <Text style={styles.sectionTitle}>{t.history.daily}</Text>
            <ScrollView style={styles.monthScrollView}>
              {monthlyData.dailyBreakdown.map(({ date, data }) => (
                <TouchableOpacity
                  key={date}
                  style={styles.dayRow}
                  onPress={() => {
                    setSelectedDate(date);
                    setViewMode('daily');
                  }}
                >
                  <Text style={styles.dayDate}>
                    {new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                  {data ? (
                    <View style={styles.dayDataContainer}>
                      <Text style={styles.dayProtein}>{formatProtein(data.totalProtein)}</Text>
                      <Text style={styles.dayMeals}>
                        {data.meals.length} {data.meals.length === 1 ? t.history.meal : t.history.meals}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noData}>-</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.history.title}</Text>
          <Text style={styles.headerSubtitle}>{t.history.subtitle}</Text>
        </View>
        
        {/* View Mode Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'daily' && styles.activeTab]}
            onPress={() => setViewMode('daily')}
          >
            <Text style={[styles.tabText, viewMode === 'daily' && styles.activeTabText]}>
              {t.history.daily}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'weekly' && styles.activeTab]}
            onPress={() => setViewMode('weekly')}
          >
            <Text style={[styles.tabText, viewMode === 'weekly' && styles.activeTabText]}>
              {t.history.weekly}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'monthly' && styles.activeTab]}
            onPress={() => setViewMode('monthly')}
          >
            <Text style={[styles.tabText, viewMode === 'monthly' && styles.activeTabText]}>
              {t.history.monthly}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateDate('prev')}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              value={selectedDate}
              onChangeText={handleDateChange}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateDate('next')}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
        
        {/* Render appropriate view */}
        {viewMode === 'daily' && renderDailyView()}
        {viewMode === 'weekly' && renderWeeklyView()}
        {viewMode === 'monthly' && renderMonthlyView()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  navButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  mealsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mealInfo: {
    flex: 1,
  },
  mealNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  mealTag: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  mealTagText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mealDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealProtein: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  dailyBreakdownSection: {
    marginTop: 8,
  },
  monthScrollView: {
    maxHeight: 400,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  dayDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayProtein: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  dayMeals: {
    fontSize: 12,
    color: '#6b7280',
  },
  noData: {
    fontSize: 16,
    color: '#d1d5db',
  },
});
