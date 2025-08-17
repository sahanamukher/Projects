import React, { useState } from 'react';
import type { FeastFormData, FeastMenu } from '../types';
import { generateFeastMenu } from '../services/geminiService';

const initialFormData: FeastFormData = {
    theme: '',
    guests: 4,
    ageGroup: 'Mixed Adults',
    cuisine: 'Any',
    allergies: [],
    otherAllergies: '',
};

const ageGroupOptions = ['Young Children', 'Teenagers', 'Young Adults', 'Mixed Adults', 'Seniors'];
const cuisineOptions = ['Any', 'Indian', 'Chinese', 'South Indian', 'North Indian', 'Greek', 'Mediterranean', 'Italian', 'Mexican', 'Japanese', 'Thai', 'American'];
const allergyOptions = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Gluten', 'Sesame'];

// Icons for form fields
const ThemeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const GuestsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CuisineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>;
const AgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// Icons for Menu
const AppetizerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.24a2 2 0 00-1.846 2.756l.542 1.918a2 2 0 001.846 1.244h8.824a2 2 0 001.846-1.244l.542-1.918a2 2 0 00-1.022-3.303z" /></svg>;
const MainCourseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3v2c0 1.657-1.343 3-3 3h-1V5h-2v3H9V5H7v3H6c-1.657 0-3-1.343-3-3V3M3 9v2c0 1.657 1.343 3 3 3h1v7h2v-7h6v7h2v-7h1c1.657 0 3-1.343 3-3V9" /></svg>;
const DessertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const BeverageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z" transform="rotate(-45 12 12) translate(-2 -2) scale(0.9)" /><path d="M11 5h2v6h-2zm0 8h2v2h-2z" transform="rotate(-45 12 12) translate(-2 -2) scale(0.9)" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l-4-4 2-2 4 4-2 2z" transform="translate(1 1) scale(0.85)" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 19l-4-4" /></svg>;


export const FeastPlanner: React.FC = () => {
    const [formData, setFormData] = useState<FeastFormData>(initialFormData);
    const [menu, setMenu] = useState<FeastMenu | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleMultiSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            allergies: prev.allergies.includes(value)
                ? prev.allergies.filter(c => c !== value)
                : [...prev.allergies, value]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.theme) {
            setError("Please enter a theme for your feast!");
            return;
        }
        setIsLoading(true);
        setError(null);
        setMenu(null);
        try {
            const result = await generateFeastMenu(formData);
            setMenu(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setFormData(initialFormData);
        setMenu(null);
        setError(null);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="text-center p-12 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-brand-dark mb-4">Planning Your Feast...</h2>
                <p className="text-gray-600 mb-6">Our AI caterer is designing the perfect menu for your occasion.</p>
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center p-12 bg-white rounded-xl shadow-lg border-2 border-red-500 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Oops! There was a hiccup.</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={handleReset} className="px-8 py-3 bg-brand-primary text-white rounded-full font-semibold hover:bg-brand-dark transition-colors">
                    Try Again
                </button>
            </div>
        );
    }
    
    if (menu) {
        return (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl animate-fade-in border-t-8 border-brand-primary">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-serif text-brand-dark mb-2">{menu.menuTitle}</h2>
                    <p className="text-gray-600 italic">{menu.description}</p>
                </div>
                
                <div className="space-y-6">
                    {[
                        { title: 'Appetizer', data: menu.appetizer, icon: <AppetizerIcon /> },
                        { title: 'Main Course', data: menu.mainCourse, icon: <MainCourseIcon /> },
                        { title: 'Dessert', data: menu.dessert, icon: <DessertIcon /> },
                        { title: 'Beverage Suggestion', data: menu.beverage, icon: <BeverageIcon /> },
                    ].map(course => (
                        <div key={course.title} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">{course.icon}</div>
                            <div>
                                <h3 className="font-bold text-xl text-brand-dark">{course.title}</h3>
                                <p className="font-semibold text-lg text-gray-800">{course.data.name}</p>
                                <p className="text-sm text-gray-600">{course.data.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                     <button onClick={handleReset} className="px-8 py-3 bg-brand-primary text-white rounded-full font-semibold hover:bg-brand-dark transition-colors">
                        Plan Another Feast
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-center text-brand-dark">Plan Your Perfect Feast</h2>
            <p className="text-center text-gray-600 mb-8">Tell us about your event, and we'll craft a memorable menu.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="theme" className="block text-lg font-medium text-gray-700 mb-2"><ThemeIcon />Theme or Occasion</label>
                        <input type="text" id="theme" value={formData.theme} onChange={e => setFormData({...formData, theme: e.target.value})} placeholder="e.g., Summer BBQ" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" required/>
                    </div>
                    <div>
                        <label htmlFor="cuisine" className="block text-lg font-medium text-gray-700 mb-2"><CuisineIcon />Cuisine Preference</label>
                        <select id="cuisine" value={formData.cuisine} onChange={e => setFormData({...formData, cuisine: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary">
                            {cuisineOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="guests" className="block text-lg font-medium text-gray-700 mb-2"><GuestsIcon/>Number of Guests</label>
                        <input type="number" id="guests" min="1" max="100" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"/>
                    </div>
                    <div>
                        <label htmlFor="ageGroup" className="block text-lg font-medium text-gray-700 mb-2"><AgeIcon />Guest Age Group</label>
                        <select id="ageGroup" value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary">
                            {ageGroupOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </div>
                 </div>

                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Allergies or Ingredients to Avoid</label>
                    <div className="flex flex-wrap gap-2">
                        {allergyOptions.map(option => (
                            <button key={option} type="button" onClick={() => handleMultiSelectChange(option)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.allergies.includes(option) ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{option}</button>
                        ))}
                    </div>
                    <input type="text" value={formData.otherAllergies} onChange={(e) => setFormData({...formData, otherAllergies: e.target.value})} placeholder="Any other allergies?" className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary" />
                </div>

                 <div className="text-center pt-4">
                    <button type="submit" className="px-10 py-4 bg-brand-secondary text-brand-text rounded-full font-bold hover:bg-yellow-500 transition-colors text-xl shadow-md hover:shadow-lg">
                        Design My Menu
                    </button>
                 </div>
            </form>
        </div>
    );
};